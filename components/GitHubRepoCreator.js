import { useState } from 'react';

export default function GitHubRepoCreator({ onRepoCreated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    private: false,
    githubToken: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);

    try {
      const response = await fetch('/api/github/create-repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        onRepoCreated(data.repository);
        setIsOpen(false);
        setFormData({
          name: '',
          description: '',
          private: false,
          githubToken: formData.githubToken // Keep token for future use
        });
      } else {
        setError(data.error || 'Failed to create repository');
      }
    } catch (err) {
      setError('Network error: Failed to create repository');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)} 
        className="github-repo-button"
        title="Create new GitHub repository"
      >
        <svg viewBox="0 0 24 24" className="github-icon">
          <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
        </svg>
        Create Repository
      </button>
    );
  }

  return (
    <div className="github-repo-modal">
      <div className="modal-backdrop" onClick={() => setIsOpen(false)} />
      <div className="modal-content">
        <div className="modal-header">
          <h3>Create GitHub Repository</h3>
          <button 
            onClick={() => setIsOpen(false)} 
            className="close-button"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="repo-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="githubToken">GitHub Personal Access Token *</label>
            <input
              type="password"
              id="githubToken"
              name="githubToken"
              value={formData.githubToken}
              onChange={handleInputChange}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              required
              className="form-input"
            />
            <small className="form-help">
              Get your token from GitHub Settings → Developer settings → Personal access tokens
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="name">Repository Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="my-awesome-project"
              required
              className="form-input"
              pattern="[a-zA-Z0-9._-]+"
              title="Repository name can only contain letters, numbers, dots, hyphens, and underscores"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="A brief description of your project"
              className="form-textarea"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="private"
                checked={formData.private}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">Private repository</span>
            </label>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="cancel-button"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isCreating || !formData.name || !formData.githubToken}
              className="create-button"
            >
              {isCreating ? 'Creating...' : 'Create Repository'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}