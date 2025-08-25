import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // Add CORS headers for better compatibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate environment variable
    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log('API Key exists:', !!apiKey);
    console.log('API Key starts with sk-ant-:', apiKey?.startsWith('sk-ant-'));
    
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not set');
      return res.status(500).json({ 
        error: 'API key not configured',
        details: 'ANTHROPIC_API_KEY environment variable is missing'
      });
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const { message } = req.body;
    console.log('Received message:', message ? 'Message received' : 'No message');
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Message is required',
        details: 'Request body must contain a non-empty message field'
      });
    }
    
    console.log('Calling Claude API...');
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: message }]
    });

    console.log('Claude API response received');
    res.status(200).json({ 
      response: response.content[0].text 
    });
  } catch (error) {
    console.error('Claude API Error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      type: error.constructor.name
    });
    
    res.status(500).json({ 
      error: 'Failed to get response from Claude',
      details: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
}