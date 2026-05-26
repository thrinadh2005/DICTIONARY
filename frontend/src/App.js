import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import SearchBar from './components/SearchBar';
import WordResult from './components/WordResult';
import Favorites from './components/Favorites';
import History from './components/History';
import Translator from './components/Translator';
import WordOfTheDay from './components/WordOfTheDay';
import CommonPhrases from './components/CommonPhrases';
import NetworkStatus from './components/NetworkStatus';
import * as dbUtils from './utils/dbUtils';

function App() {
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('search');
  const [swRegistration, setSwRegistration] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [notificationPermission, setNotificationPermission] = useState(() =>
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );
  const [toast, setToast] = useState(null); // { msg, type: 'success'|'info'|'warning' }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Word-of-the-Day push notification ────────────────────────────────────────
  const triggerWordOfTheDayNotification = useCallback(async () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      const response = await fetch('/api/wordoftheday');
      if (!response.ok) return;
      const wordObj = await response.json();

      const todayDate = new Date().toDateString();
      const lastNotifiedWord = localStorage.getItem('last_notified_word');
      const lastNotificationDate = localStorage.getItem('last_notification_date');

      if (lastNotifiedWord !== wordObj.word || lastNotificationDate !== todayDate) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification(`✨ Word of the Day: ${wordObj.word}`, {
          body: `${wordObj.partOfSpeech} — ${wordObj.definition}`,
          icon: '/logo-small.svg',
          badge: '/favicon.ico',
          tag: 'word-of-the-day',
          renotify: true,
          data: { url: `/?word=${encodeURIComponent(wordObj.word)}` }
        });
        localStorage.setItem('last_notified_word', wordObj.word);
        localStorage.setItem('last_notification_date', todayDate);
      }
    } catch (err) {
      console.error('Notification error:', err);
    }
  }, []);

  // ── Service Worker registration ───────────────────────────────────────────────
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then(registration => {
          setSwRegistration(registration);
          setInterval(() => registration.update(), 60000);

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          });

          setTimeout(() => triggerWordOfTheDayNotification(), 1500);
        })
        .catch(err => console.warn('Service Worker registration failed:', err));
    }
    dbUtils.initDB();
  }, [triggerWordOfTheDayNotification]);

  // ── Deep-link: handle ?word= query param on load ──────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wordParam = params.get('word');
    if (wordParam) {
      searchWord(wordParam);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Theme sync ────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // ── Notification permission request ──────────────────────────────────────────
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      showToast('This browser does not support notifications.', 'warning');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      showToast('🔔 Notifications enabled! You\'ll get the daily Word of the Day.', 'success');
      triggerWordOfTheDayNotification();
    } else {
      showToast('Notifications blocked. You can enable them in browser settings.', 'warning');
    }
  };

  // ── SW update apply ───────────────────────────────────────────────────────────
  const handleUpdate = () => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  // ── Dictionary search ─────────────────────────────────────────────────────────
  const searchWord = async (word) => {
    if (!word || word.trim() === '') {
      setError('Please enter a word to search.');
      return;
    }

    setLoading(true);
    setError(null);
    setActiveTab('search');

    try {
      const response = await fetch(`/api/define/${encodeURIComponent(word.trim())}`);
      if (!response.ok) throw new Error('Word not found');
      const data = await response.json();
      setWordData(data);

      // Persist to IndexedDB for offline use
      await dbUtils.saveDefinition(word, data);

      // Update search history (max 20, deduplicated)
      const history = JSON.parse(localStorage.getItem('history')) || [];
      const lower = word.toLowerCase().trim();
      const filtered = history.filter(w => w.toLowerCase() !== lower);
      localStorage.setItem('history', JSON.stringify([lower, ...filtered].slice(0, 20)));
    } catch (err) {
      // Fallback to IndexedDB cache
      try {
        const cachedData = await dbUtils.getDefinition(word);
        if (cachedData) {
          setWordData(cachedData);
          setError('⚠️ Offline mode — showing cached result.');
        } else {
          setError('Word not found. Check your spelling or internet connection.');
          setWordData(null);
        }
      } catch {
        setError('Could not fetch definition. Please try again.');
        setWordData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="container">
      <div className="glass-container shadow">
        <NetworkStatus />

        {/* App-update banner */}
        {updateAvailable && (
          <div className="notification-banner mb-3">
            <span>🚀 <strong>Update available!</strong> A new version of Lexicon Hub is ready.</span>
            <button className="btn btn-premium btn-sm" onClick={handleUpdate}>
              Reload &amp; Update
            </button>
          </div>
        )}

        {/* Push notification prompt */}
        {notificationPermission === 'default' && (
          <div className="notification-banner">
            <span style={{ fontSize: '0.95rem' }}>
              🔔 Enable daily <strong>Word of the Day</strong> notifications on this device.
            </span>
            <button className="btn btn-premium btn-sm px-3" onClick={requestNotificationPermission}>
              Enable
            </button>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            className="animate-fade-in"
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              right: '1.5rem',
              zIndex: 9999,
              minWidth: '260px',
              maxWidth: '380px',
              background: toast.type === 'success'
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : toast.type === 'warning'
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'var(--accent-gradient)',
              color: '#fff',
              padding: '0.9rem 1.25rem',
              borderRadius: 'var(--border-radius-md)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              fontSize: '0.95rem',
              fontWeight: 500
            }}
          >
            {toast.msg}
          </div>
        )}

        {/* ── Header ── */}
        <header className="mb-5 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="me-3" style={{ fontSize: '2.8rem', lineHeight: 1 }}>📚</div>
            <div>
              <h1 className="mb-0 text-gradient font-weight-bold">Lexicon Hub</h1>
              <span className="subtext text-muted">Complete Dictionary &amp; Translator Suite</span>
            </div>
          </div>
          <button
            className="theme-toggle-btn shadow-sm"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </header>

        {/* ── Tab Navigation ── */}
        <ul className="nav nav-tabs mb-4" role="tablist">
          {[
            { key: 'search',    label: '📖 Dictionary' },
            { key: 'translate', label: '🌐 Translate'  },
            { key: 'phrases',   label: '💬 Phrasebook' },
            { key: 'favorites', label: '❤️ Favorites'  },
            { key: 'history',   label: '⏳ History'    },
          ].map(tab => (
            <li key={tab.key} className="nav-item" role="presentation">
              <button
                id={`tab-${tab.key}`}
                className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
                role="tab"
                aria-selected={activeTab === tab.key}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        {/* ── Tab Content ── */}
        <div className="tab-content">
          {activeTab === 'search' && (
            <div className="animate-fade-in">
              <SearchBar onSearch={searchWord} />

              {loading && (
                <div className="text-center my-5">
                  <div className="spinner-border text-primary" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
                    <span className="visually-hidden">Searching…</span>
                  </div>
                  <p className="text-secondary mt-3 mb-0">Looking up definition…</p>
                </div>
              )}

              {error && (
                <div className="alert alert-warning mt-3 shadow-sm border-0 animate-fade-in">
                  {error}
                </div>
              )}

              {wordData && !loading && <WordResult wordData={wordData} />}

              {!loading && !wordData && <WordOfTheDay onSearch={searchWord} />}
            </div>
          )}

          {activeTab === 'translate' && <Translator />}
          {activeTab === 'phrases'   && <CommonPhrases />}
          {activeTab === 'favorites' && <Favorites onSearch={searchWord} />}
          {activeTab === 'history'   && <History onSearch={searchWord} />}
        </div>
      </div>
    </div>
  );
}

export default App;
