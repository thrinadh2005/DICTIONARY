import React, { useState, useEffect } from 'react';

const LANGUAGES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'zh-CN': 'Chinese (Simplified)',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'te': 'Telugu',
  'ta': 'Tamil',
  'nl': 'Dutch',
  'tr': 'Turkish',
  'vi': 'Vietnamese',
  'pl': 'Polish'
};

const Favorites = ({ onSearch }) => {
  const [subTab, setSubTab] = useState('words');
  const [favoriteWords, setFavoriteWords] = useState([]);
  const [favoriteTranslations, setFavoriteTranslations] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    loadFavorites();
    const handleStorageChange = () => {
      loadFavorites();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadFavorites = () => {
    const words = JSON.parse(localStorage.getItem('favorites')) || [];
    const translations = JSON.parse(localStorage.getItem('translation_favorites')) || [];
    setFavoriteWords(words);
    setFavoriteTranslations(translations);
  };

  const removeWord = (word) => {
    const updated = favoriteWords.filter(w => w !== word);
    setFavoriteWords(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const removeTranslation = (index) => {
    const updated = favoriteTranslations.filter((_, idx) => idx !== index);
    setFavoriteTranslations(updated);
    localStorage.setItem('translation_favorites', JSON.stringify(updated));
  };

  const clearAllWords = () => {
    if (window.confirm('Are you sure you want to clear all favorited words?')) {
      setFavoriteWords([]);
      localStorage.removeItem('favorites');
    }
  };

  const clearAllTranslations = () => {
    if (window.confirm('Are you sure you want to clear all favorited translations?')) {
      setFavoriteTranslations([]);
      localStorage.removeItem('translation_favorites');
    }
  };

  const handleTTS = (text, lang) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  return (
    <div className="card border-0 shadow-sm glass-card p-4 animate-fade-in mb-4">
      <div className="d-flex align-items-center mb-4">
        <span style={{ fontSize: '1.8rem' }} className="me-2">❤️</span>
        <h3 className="mb-0 text-gradient">Favorites</h3>
      </div>

      {/* Sub-tabs for Words / Translations */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${subTab === 'words' ? 'active' : ''}`} 
            onClick={() => setSubTab('words')}
            style={{ fontSize: '0.95rem' }}
          >
            📚 Words ({favoriteWords.length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${subTab === 'translations' ? 'active' : ''}`} 
            onClick={() => setSubTab('translations')}
            style={{ fontSize: '0.95rem' }}
          >
            🌐 Translations ({favoriteTranslations.length})
          </button>
        </li>
      </ul>

      {subTab === 'words' ? (
        <div>
          {favoriteWords.length === 0 ? (
            <div className="alert alert-info bg-transparent border-0 text-secondary p-0">
              No favorited words yet. Click "Save Word" on any word result to save it here.
            </div>
          ) : (
            <>
              <ul className="list-group mb-3">
                {favoriteWords.map((word, index) => (
                  <li key={index} className="list-group-item list-group-item-custom d-flex justify-content-between align-items-center p-3">
                    <button 
                      className="btn btn-link text-decoration-none text-start text-primary fw-bold p-0 fs-5"
                      onClick={() => onSearch(word)}
                    >
                      {word}
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger border-0" 
                      onClick={() => removeWord(word)}
                    >
                      ❌ Remove
                    </button>
                  </li>
                ))}
              </ul>
              <button className="btn btn-glass-secondary btn-sm" onClick={clearAllWords}>
                🗑️ Clear All Words
              </button>
            </>
          )}
        </div>
      ) : (
        <div>
          {favoriteTranslations.length === 0 ? (
            <div className="alert alert-info bg-transparent border-0 text-secondary p-0">
              No saved translations yet. Click the heart icon on any translation result to save it here.
            </div>
          ) : (
            <>
              <div className="row g-3 mb-3">
                {favoriteTranslations.map((item, index) => (
                  <div key={index} className="col-12 col-md-6">
                    <div className="card list-group-item-custom p-3 h-100">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <span className="badge bg-secondary opacity-75 me-2">
                            {LANGUAGES[item.from] || item.from} ➔ {LANGUAGES[item.to] || item.to}
                          </span>
                        </div>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-link p-1 text-decoration-none"
                            onClick={() => handleTTS(item.translatedText, item.to)}
                            title="Speak translation"
                          >
                            🔊
                          </button>
                          <button 
                            className="btn btn-sm btn-link p-1 text-decoration-none"
                            onClick={() => handleCopy(item.translatedText, index)}
                            title="Copy translation"
                          >
                            {copiedIndex === index ? '✓' : '📋'}
                          </button>
                          <button 
                            className="btn btn-sm btn-link text-danger p-1 text-decoration-none" 
                            onClick={() => removeTranslation(index)}
                            title="Delete"
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                      <div className="mb-2 text-secondary italic">"{item.text}"</div>
                      <div className="fw-bold text-gradient fs-5">{item.translatedText}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-glass-secondary btn-sm" onClick={clearAllTranslations}>
                🗑️ Clear All Translations
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Favorites;
