import Head from 'next/head';
import { useEffect, useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import GitHubRepoCreator from '../components/GitHubRepoCreator';

export default function Home() {
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  const handleRepoCreated = (repository) => {
    setRepositories(prev => [...prev, repository]);
    setSelectedRepo(repository);
    console.log('Repository created:', repository);
  };

  return (
    <>
      <Head>
        <title>Claude Agent</title>
        <meta name="description" content="Chat with Claude AI assistant" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#007AFF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Claude Agent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="preconnect" href="https://api.anthropic.com" />
      </Head>
      <div className="app-container">
        <header className="app-header">
          <h1>Claude Agent</h1>
        </header>
        <main className="app-main">
          <div className="main-content">
            <div className="toolbar">
              <GitHubRepoCreator onRepoCreated={handleRepoCreated} />
              {repositories.length > 0 && (
                <div className="repo-selector">
                  <select 
                    value={selectedRepo?.name || ''} 
                    onChange={(e) => {
                      const repo = repositories.find(r => r.name === e.target.value);
                      setSelectedRepo(repo);
                    }}
                    className="repo-select"
                  >
                    <option value="">Select repository...</option>
                    {repositories.map(repo => (
                      <option key={repo.name} value={repo.name}>
                        {repo.name}
                      </option>
                    ))}
                  </select>
                  {selectedRepo && (
                    <span className="repo-info">
                      📁 {selectedRepo.name}
                    </span>
                  )}
                </div>
              )}
            </div>
            <ChatInterface selectedRepository={selectedRepo} />
          </div>
        </main>
      </div>
    </>
  );
}