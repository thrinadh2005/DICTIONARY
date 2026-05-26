import React, { useState } from 'react';

const CATEGORIES = {
  greetings: { label: '👋 Greetings', icon: '👋' },
  essentials: { label: '⚙️ Essentials', icon: '⚙️' },
  dining: { label: '🍽️ Dining', icon: '🍽️' },
  directions: { label: '🗺️ Directions', icon: '🗺️' },
  emergency: { label: '🚨 Emergency', icon: '🚨' }
};

const PHRASES = {
  greetings: [
    'Hello, nice to meet you.',
    'Good morning.',
    'How are you?',
    'Thank you very much.',
    'Excuse me.',
    'Goodbye.'
  ],
  essentials: [
    'Yes, please.',
    'No, thank you.',
    'Do you speak English?',
    'I do not understand.',
    'Can you help me?',
    'Where is the Wi-Fi?'
  ],
  dining: [
    'A table for two, please.',
    'May I have the menu?',
    'Could I get a glass of water?',
    'I would like to order this.',
    'The bill, please.',
    'It was delicious.'
  ],
  directions: [
    'Where is the restroom?',
    'How do I get to the train station?',
    'Is it far from here?',
    'Turn left at the next street.',
    'Where is the nearest hotel?',
    'Please show me on the map.'
  ],
  emergency: [
    'Help me, please!',
    'It is an emergency.',
    'I need a doctor.',
    'Call the police.',
    'I lost my passport.',
    'Where is the pharmacy?'
  ]
};

const LANGUAGES = {
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

const CommonPhrases = () => {
  const [activeCategory, setActiveCategory] = useState('greetings');
  const [toLang, setToLang] = useState('es');
  const [translations, setTranslations] = useState({}); // cached as: { "hello_es": "hola" }
  const [loadingPhrase, setLoadingPhrase] = useState(null); // the phrase index currently translating
  const [copiedPhrase, setCopiedPhrase] = useState(null);

  const translatePhrase = async (phrase, index) => {
    const cacheKey = `${phrase}_${toLang}`;
    if (translations[cacheKey]) {
      return; // Already cached
    }

    setLoadingPhrase(index);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: phrase,
          from: 'en',
          to: toLang
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTranslations(prev => ({
          ...prev,
          [cacheKey]: data.translatedText
        }));
      }
    } catch (error) {
      console.error('Phrase translation error:', error);
    } finally {
      setLoadingPhrase(null);
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
      setCopiedPhrase(index);
      setTimeout(() => setCopiedPhrase(null), 2000);
    });
  };

  return (
    <div className="card border-0 shadow-sm glass-card p-4 mb-4 animate-fade-in">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div className="d-flex align-items-center">
          <span style={{ fontSize: '1.8rem' }} className="me-2">📖</span>
          <h3 className="mb-0 text-gradient">Travel & Daily Phrasebook</h3>
        </div>
        
        <div className="d-flex align-items-center gap-2">
          <label className="text-secondary text-nowrap mb-0 fs-6">Translate to:</label>
          <select 
            className="form-select border-0 shadow-sm py-1" 
            style={{ width: '160px' }}
            value={toLang}
            onChange={(e) => setToLang(e.target.value)}
          >
            {Object.entries(LANGUAGES).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            className={`btn ${activeCategory === key ? 'btn-premium' : 'btn-glass-secondary'} py-2 px-3 border-0`}
            onClick={() => setActiveCategory(key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Phrase List */}
      <div className="row g-3">
        {PHRASES[activeCategory].map((phrase, idx) => {
          const cacheKey = `${phrase}_${toLang}`;
          const translation = translations[cacheKey];
          const isLoading = loadingPhrase === idx;

          return (
            <div key={idx} className="col-12 col-md-6">
              <div 
                className="card h-100 p-3 list-group-item-custom"
                style={{ cursor: 'pointer' }}
                onClick={() => translatePhrase(phrase, idx)}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1 text-primary">{phrase}</h6>
                    {isLoading ? (
                      <div className="spinner-border spinner-border-sm text-primary mt-1" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : translation ? (
                      <p className="mb-0 text-gradient fs-5 mt-1">{translation}</p>
                    ) : (
                      <small className="text-muted italic">Click to translate</small>
                    )}
                  </div>
                  
                  {translation && (
                    <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="btn btn-sm btn-link p-1 text-decoration-none" 
                        onClick={() => handleTTS(translation, toLang)}
                        title="Listen to translation"
                      >
                        🔊
                      </button>
                      <button 
                        className="btn btn-sm btn-link p-1 text-decoration-none" 
                        onClick={() => handleCopy(translation, idx)}
                        title="Copy to clipboard"
                      >
                        {copiedPhrase === idx ? '✓' : '📋'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommonPhrases;
