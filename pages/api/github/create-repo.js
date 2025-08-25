export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, description, private: isPrivate, githubToken } = req.body;

    // Validate required fields
    if (!name || !githubToken) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Repository name and GitHub token are required'
      });
    }

    // Validate token format
    if (!githubToken.startsWith('ghp_') && !githubToken.startsWith('github_pat_')) {
      return res.status(400).json({
        error: 'Invalid token format',
        details: 'GitHub personal access token should start with "ghp_" or "github_pat_"'
      });
    }

    // Create repository using GitHub API
    const createRepoResponse = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'claude-agent'
      },
      body: JSON.stringify({
        name,
        description: description || '',
        private: !!isPrivate,
        auto_init: true, // Initialize with README
        gitignore_template: 'Node', // Add Node.js gitignore
        license_template: 'mit' // Add MIT license
      })
    });

    const repoData = await createRepoResponse.json();

    if (!createRepoResponse.ok) {
      console.error('GitHub API Error:', repoData);
      return res.status(createRepoResponse.status).json({
        error: 'GitHub API Error',
        details: repoData.message || 'Failed to create repository',
        githubError: repoData
      });
    }

    // Return repository information
    res.status(201).json({
      success: true,
      repository: {
        name: repoData.name,
        fullName: repoData.full_name,
        url: repoData.html_url,
        cloneUrl: repoData.clone_url,
        sshUrl: repoData.ssh_url,
        description: repoData.description,
        private: repoData.private,
        defaultBranch: repoData.default_branch,
        owner: repoData.owner.login,
        createdAt: repoData.created_at
      }
    });

  } catch (error) {
    console.error('Repository creation error:', error);
    res.status(500).json({
      error: 'Server error',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}