import { useState, useEffect, useRef } from 'react';

export default function ChatInterface({ selectedRepository }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('chat'); // 'chat' or 'git'
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputValue, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Use enhanced API if repository is selected and mode is git
      const apiEndpoint = (selectedRepository && mode === 'git') ? '/api/claude-git' : '/api/chat';
      
      const requestBody = {
        message: messageToSend,
        operation: mode,
        ...(selectedRepository && mode === 'git' && {
          repository: selectedRepository,
          githubToken: localStorage.getItem('github_token') // We'll store this temporarily
        })
      };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (response.ok) {
        const assistantMessage = { 
          role: 'assistant', 
          content: data.response,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage = { 
          role: 'error', 
          content: data.error || 'Something went wrong',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = { 
        role: 'error', 
        content: 'Failed to send message',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <div className="welcome-content">
                <h2>👋 Hello!</h2>
                <p>I'm Claude, your AI assistant.</p>
                {selectedRepository ? (
                  <div className="welcome-repo">
                    <p>🎯 Working with: <strong>{selectedRepository.name}</strong></p>
                    <p>Switch to Git mode to create files and make commits!</p>
                  </div>
                ) : (
                  <p>Ask me anything or create a repository to get started!</p>
                )}
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-bubble">
                <div className="message-content">
                  {message.content}
                </div>
                <div className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant loading">
              <div className="message-bubble">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {selectedRepository && (
        <div className="mode-toggle">
          <div className="mode-buttons">
            <button
              type="button"
              onClick={() => setMode('chat')}
              className={`mode-button ${mode === 'chat' ? 'active' : ''}`}
            >
              💬 Chat Mode
            </button>
            <button
              type="button"
              onClick={() => setMode('git')}
              className={`mode-button ${mode === 'git' ? 'active' : ''}`}
            >
              🔧 Git Mode
            </button>
          </div>
          <div className="mode-info">
            {mode === 'chat' ? (
              <span>General conversation with Claude</span>
            ) : (
              <span>Claude can create/modify files in {selectedRepository.name}</span>
            )}
          </div>
        </div>
      )}
      
      <form onSubmit={sendMessage} className="input-form">
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              selectedRepository && mode === 'git' 
                ? `Tell Claude what to build in ${selectedRepository.name}...`
                : "Message Claude..."
            }
            disabled={isLoading}
            className="message-input"
            autoComplete="off"
          />
          <button 
            type="submit" 
            disabled={isLoading || !inputValue.trim()} 
            className="send-button"
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" className="send-icon">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}