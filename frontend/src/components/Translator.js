import React, { useState, useEffect } from 'react';

const LANGUAGES = {
  'auto': 'Detect Language',
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

const Translator = () => {
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [fromLang, setFromLang] = useState('auto');
  const [toLang, setToLang] = useState('es');
  const [detectedLang, setDetectedLang] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Sync favorited state when text/translation changes
  useEffect(() => {
    if (!translatedText) {
      setIsFavorited(false);
      return;
    }
    const saved = JSON.parse(localStorage.getItem('translation_favorites')) || [];
    const exists = saved.some(item => 
      item.text.toLowerCase() === text.trim().toLowerCase() && 
      item.to === toLang
    );
    setIsFavorited(exists);
  }, [text, translatedText, toLang]);

  const handleTranslate = async () => {
    if (!text || text.trim() === '') {
      setError('Please enter some text to translate.');
      return;
    }

    setLoading(true);
    setError(null);
    setTranslatedText('');
    setDetectedLang('');

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text.trim(),
          from: fromLang,
          to: toLang
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch translation');
      }

      const data = await response.json();
      setTranslatedText(data.translatedText);
      if (fromLang === 'auto' && data.detectedSource) {
        setDetectedLang(data.detectedSource);
      }

      // Add to translation history
      const history = JSON.parse(localStorage.getItem('translation_history')) || [];
      const newEntry = {
        text: text.trim(),
        translatedText: data.translatedText,
        from: fromLang === 'auto' ? data.detectedSource : fromLang,
        to: toLang,
        timestamp: Date.now()
      };
      
      // Remove duplicate histories
      const filteredHistory = history.filter(h => 
        !(h.text.toLowerCase() === newEntry.text.toLowerCase() && h.to === newEntry.to)
      );
      
      localStorage.setItem('translation_history', JSON.stringify([newEntry, ...filteredHistory].slice(0, 10)));
    } catch (err) {
      console.error(err);
      setError('Translation error. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    if (fromLang === 'auto') return; // Cannot swap with auto-detect
    const temp = fromLang;
    setFromLang(toLang);
    setToLang(temp);
    setText(translatedText);
    setTranslatedText(text);
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleTTS = (speakText, lang) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(speakText);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in this browser.');
    }
  };

  const toggleFavorite = () => {
    if (!translatedText) return;
    const saved = JSON.parse(localStorage.getItem('translation_favorites')) || [];
    
    if (isFavorited) {
      const filtered = saved.filter(item => 
        !(item.text.toLowerCase() === text.trim().toLowerCase() && item.to === toLang)
      );
      localStorage.setItem('translation_favorites', JSON.stringify(filtered));
      setIsFavorited(false);
    } else {
      const newFav = {
        text: text.trim(),
        translatedText,
        from: fromLang === 'auto' ? (detectedLang || 'en') : fromLang,
        to: toLang,
        timestamp: Date.now()
      };
      localStorage.setItem('translation_favorites', JSON.stringify([...saved, newFav]));
      setIsFavorited(true);
    }
  };

  return (
    <div className="card border-0 shadow-sm glass-card p-4 mb-4 animate-fade-in">
      <div className="d-flex align-items-center mb-4">
        <span style={{ fontSize: '1.8rem' }} className="me-2">🌐</span>
        <h3 className="mb-0 text-gradient">Universal Translator</h3>
      </div>

      <div className="row g-3 align-items-center mb-3">
        <div className="col-5 col-md-4">
          <select 
            className="form-select border-0 shadow-sm" 
            value={fromLang} 
            onChange={(e) => setFromLang(e.target.value)}
          >
            {Object.entries(LANGUAGES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-2 text-center">
          <button 
            type="button" 
            className="btn btn-glass-secondary border-0 rounded-circle" 
            onClick={handleSwap}
            disabled={fromLang === 'auto'}
            title={fromLang === 'auto' ? 'Cannot swap when language detection is selected' : 'Swap languages'}
            style={{ width: '42px', height: '42px', padding: 0 }}
          >
            ↔️
          </button>
        </div>

        <div className="col-5 col-md-4">
          <select 
            className="form-select border-0 shadow-sm" 
            value={toLang} 
            onChange={(e) => setToLang(e.target.value)}
          >
            {Object.entries(LANGUAGES).filter(([code]) => code !== 'auto').map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="position-relative">
            <textarea
              className="form-control border-0 shadow-sm translate-textarea p-3"
              placeholder="Enter text to translate..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={2000}
            />
            <div className="position-absolute bottom-0 end-0 p-2 d-flex gap-2">
              {text && (
                <>
                  <button 
                    className="btn btn-sm btn-light border" 
                    onClick={() => handleTTS(text, fromLang === 'auto' ? 'en-US' : fromLang)}
                    title="Listen to original text"
                  >
                    🔊
                  </button>
                  <button 
                    className="btn btn-sm btn-light border" 
                    onClick={() => setText('')}
                    title="Clear"
                  >
                    ❌
                  </button>
                </>
              )}
              <span className="badge bg-secondary opacity-75 d-flex align-items-center">
                {text.length}/2000
              </span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="translate-output-box shadow-sm border-0">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center h-100 position-absolute start-0 end-0 top-0 bottom-0">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Translating...</span>
                </div>
              </div>
            ) : translatedText ? (
              <>
                <div className="pe-5 pb-4 h-100 overflow-auto">
                  {translatedText}
                </div>
                <div className="position-absolute bottom-0 end-0 p-2 d-flex gap-2">
                  <button 
                    className={`btn btn-sm ${isFavorited ? 'btn-danger' : 'btn-light border'}`} 
                    onClick={toggleFavorite}
                    title={isFavorited ? 'Remove from favorites' : 'Save translation'}
                  >
                    {isFavorited ? '❤️' : '🤍'}
                  </button>
                  <button 
                    className="btn btn-sm btn-light border" 
                    onClick={() => handleTTS(translatedText, toLang)}
                    title="Listen to translation"
                  >
                    🔊
                  </button>
                  <button 
                    className="btn btn-sm btn-light border" 
                    onClick={handleCopy}
                    title="Copy translation"
                  >
                    {isCopied ? '✓ Copied' : '📋'}
                  </button>
                </div>
              </>
            ) : (
              <span className="text-muted italic">Translation will appear here...</span>
            )}
          </div>
          {detectedLang && (
            <div className="mt-2 text-end">
              <span className="badge bg-info text-dark">
                Detected source language: {LANGUAGES[detectedLang] || detectedLang}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-end">
        <button 
          className="btn btn-premium px-4" 
          onClick={handleTranslate}
          disabled={loading || !text.trim()}
        >
          {loading ? 'Translating...' : 'Translate'}
        </button>
      </div>

      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
};

export default Translator;
