import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import SearchBar from './components/SearchBar';
import WordResult from './components/WordResult';
import Favorites from './components/Favorites';
import History from './components/History';
import NetworkStatus from './components/NetworkStatus';
import * as dbUtils from './utils/dbUtils';

function App() {
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('search');
  const [swRegistration, setSwRegistration] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Register service worker on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
        .then(registration => {
          console.log('Service Worker registered successfully:', registration);
          setSwRegistration(registration);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          });
        })
        .catch(error => console.log('Service Worker registration failed:', error));
    }

    // Initialize database
    dbUtils.initDB();
  }, []);

  const handleUpdate = () => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const searchWord = async (word) => {
    if (!word || word.trim() === '') {
      setError('Please enter a word to search');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Try to fetch from API
      const response = await fetch(`/api/define/${word}`);

      if (!response.ok) {
        throw new Error('Word not found');
      }

      const data = await response.json();
      setWordData(data);

      // Save to IndexedDB for offline use
      await dbUtils.saveDefinition(word, data);

      // Add to history
      const history = JSON.parse(localStorage.getItem('history')) || [];
      if (!history.includes(word)) {
        history.unshift(word);
        localStorage.setItem('history', JSON.stringify(history.slice(0, 10))); // Keep last 10
      }
    } catch (err) {
      // Try to get from cache
      try {
        const cachedData = await dbUtils.getDefinition(word);
        if (cachedData) {
          setWordData(cachedData);
          setError('⚠️ Using cached data (Offline Mode)');
        } else {
          setError('Word not found. Make sure you\'re online to search.');
          setWordData(null);
        }
      } catch (dbError) {
        setError('Could not fetch word definition');
        setWordData(null);
      }
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <NetworkStatus />

      {updateAvailable && (
        <div className="alert alert-info alert-dismissible fade show" role="alert">
          <strong>Update Available!</strong> A new version of the app is ready.
          <button type="button" className="btn btn-sm btn-info ms-2" onClick={handleUpdate}>
            Reload to Update
          </button>
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      )}

      <header className="app-hero mb-4 p-3 rounded">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="app-logo me-3" style={{ fontSize: '2rem' }}>📖</div>
            <div>
              <h1 className="mb-0 app-title">My Dictionary</h1>
              <small className="text-muted">Fast. Simple. Offline Ready.</small>
            </div>
          </div>
        </div>
      </header>
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
            <svg width="16" height="16" fill="currentColor" className="bi bi-search me-2" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
            Search
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>
            <svg width="16" height="16" fill="currentColor" className="bi bi-heart-fill me-2" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
            </svg>
            Favorites
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <svg width="16" height="16" fill="currentColor" className="bi bi-clock-history me-2" viewBox="0 0 16 16">
              <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 1 1 .589.025l.004.006.004-.006.004.006A7.965 7.965 0 0 0 8 1c-3.22 0-5.887 2.178-6.813 5.167C1.121 7.025 1 7.5 1 8c0 3.866 3.134 7 7 7s7-3.134 7-7c0-.5-.121-.975-.187-1.833C13.887 3.178 11.22 1 8 1z" />
              <path d="M8 3.993c1.664-1.711 5.825 1.283 0 5.132-5.825-3.85-1.664-6.843 0-5.132z" />
            </svg>
            History
          </button>
        </li>
      </ul>
      <div className="tab-content mt-4">
        {activeTab === 'search' && (
          <div>
            <SearchBar onSearch={searchWord} />
            {loading && <div className="text-center mt-3"><div className="spinner-border" role="status"><span className="sr-only">Loading...</span></div></div>}
            {error && <div className="alert alert-warning mt-3">{error}</div>}
            {wordData && <WordResult wordData={wordData} />}
          </div>
        )}
        {activeTab === 'favorites' && <Favorites />}
        {activeTab === 'history' && <History onSearch={searchWord} />}
      </div>
    </div>
  );
}

export default App;
