import Anthropic from '@anthropic-ai/sdk';
import { simpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'API key not configured',
        details: 'ANTHROPIC_API_KEY environment variable is missing'
      });
    }

    const anthropic = new Anthropic({ apiKey });
    const { message, repository, githubToken, operation = 'chat' } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Message is required',
        details: 'Request body must contain a non-empty message field'
      });
    }

    // For regular chat without repository operations
    if (operation === 'chat' || !repository) {
      console.log('Processing regular chat message...');
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: message }]
      });

      return res.status(200).json({ 
        response: response.content[0].text,
        operation: 'chat'
      });
    }

    // For repository operations
    if (operation === 'git' && repository && githubToken) {
      console.log('Processing git operation for repository:', repository.name);

      // Create enhanced prompt for Claude with repository context
      const enhancedPrompt = `
You are a development assistant working with a GitHub repository called "${repository.name}".

Repository details:
- Name: ${repository.name}
- Full name: ${repository.fullName}
- URL: ${repository.url}
- Description: ${repository.description}
- Private: ${repository.private}

User request: ${message}

Based on this request, please provide:
1. A clear explanation of what needs to be done
2. The code or files that should be created/modified
3. Any specific file paths or structures needed

Format your response to be actionable for implementing the changes to the repository.
      `;

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content: enhancedPrompt }]
      });

      // For now, return the enhanced response
      // TODO: Implement actual git operations in a secure environment
      return res.status(200).json({
        response: response.content[0].text,
        operation: 'git',
        repository: repository.name,
        note: 'Git operations are enhanced with repository context. Actual file operations will be implemented in the next phase.'
      });
    }

    return res.status(400).json({
      error: 'Invalid operation',
      details: 'Operation must be "chat" or "git" with valid repository data'
    });

  } catch (error) {
    console.error('Claude Git API Error:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
}