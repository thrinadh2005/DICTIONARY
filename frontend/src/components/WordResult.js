import React, { useState, useEffect } from 'react';
import * as dbUtils from '../utils/dbUtils';

const WordResult = ({ wordData }) => {
  const [synonyms, setSynonyms] = useState([]);
  const [antonyms, setAntonyms] = useState([]);
  const [loadingSynonyms, setLoadingSynonyms] = useState(false);
  const [loadingAntonyms, setLoadingAntonyms] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const word = wordData && wordData[0] ? wordData[0] : null;

  useEffect(() => {
    if (word) {
      fetchSynonyms(word.word);
      fetchAntonyms(word.word);
      checkFavoriteStatus(word.word);
    }
  }, [word]);

  const checkFavoriteStatus = (w) => {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setIsFavorited(favorites.includes(w.toLowerCase()));
  };

  const fetchSynonyms = async (w) => {
    setLoadingSynonyms(true);
    try {
      const response = await fetch(`/api/synonyms/${w}`);
      if (response.ok) {
        const data = await response.json();
        const synonymList = data.slice(0, 8).map(item => item.word);
        setSynonyms(synonymList);
        await dbUtils.saveSynonyms(w, synonymList);
      }
    } catch (error) {
      // Try to get from cache
      const cachedData = await dbUtils.getSynonyms(w);
      if (cachedData) {
        setSynonyms(cachedData);
      }
    } finally {
      setLoadingSynonyms(false);
    }
  };

  const fetchAntonyms = async (w) => {
    setLoadingAntonyms(true);
    try {
      const response = await fetch(`/api/antonyms/${w}`);
      if (response.ok) {
        const data = await response.json();
        const antonymList = data.slice(0, 8).map(item => item.word);
        setAntonyms(antonymList);
        await dbUtils.saveAntonyms(w, antonymList);
      }
    } catch (error) {
      // Try to get from cache
      const cachedData = await dbUtils.getAntonyms(w);
      if (cachedData) {
        setAntonyms(cachedData);
      }
    } finally {
      setLoadingAntonyms(false);
    }
  };

  if (!word) return null;

  // Find phonetic with audio or text
  const phonetics = word.phonetics || [];
  const phoneticWithAudio = phonetics.find(p => p.audio && p.audio.trim() !== '');
  const phoneticText = phonetics.find(p => p.text)?.text || (word.phonetic ? word.phonetic : '');

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const lowerWord = word.word.toLowerCase();
    
    if (isFavorited) {
      const updated = favorites.filter(fav => fav !== lowerWord);
      localStorage.setItem('favorites', JSON.stringify(updated));
      setIsFavorited(false);
    } else {
      favorites.push(lowerWord);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorited(true);
    }
  };

  const handleCopyDefinition = (definitionText) => {
    navigator.clipboard.writeText(`"${word.word}" definition: ${definitionText}`);
    alert('✓ Copied definition to clipboard!');
  };

  return (
    <div className="card border-0 shadow-sm glass-card p-4 animate-fade-in mb-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h1 className="text-gradient mb-1" style={{ fontSize: '2.5rem' }}>{word.word}</h1>
          {phoneticText && (
            <span className="text-secondary fs-5 font-monospace">{phoneticText}</span>
          )}
        </div>
        <button 
          className={`btn ${isFavorited ? 'btn-danger' : 'btn-glass-secondary'} d-flex align-items-center gap-2`}
          onClick={toggleFavorite}
        >
          {isFavorited ? '❤️ Favorited' : '🤍 Save Word'}
        </button>
      </div>

      {phoneticWithAudio && (
        <div className="mb-4">
          <button 
            className="btn btn-premium btn-sm py-2 px-3 d-flex align-items-center gap-2" 
            onClick={() => {
              try {
                new Audio(phoneticWithAudio.audio).play();
              } catch (err) {
                console.error('Error playing audio:', err);
              }
            }}
          >
            🔊 Play Audio Pronunciation
          </button>
        </div>
      )}

      <hr className="my-4" style={{ opacity: 0.15 }} />

      {/* Loop meanings */}
      <div className="mb-4">
        {word.meanings.map((meaning, index) => (
          <div key={index} className="mb-4">
            <div className="d-flex align-items-center mb-2">
              <span className="badge bg-primary text-uppercase px-3 py-1 me-2" style={{ borderRadius: '20px', letterSpacing: '0.5px' }}>
                {meaning.partOfSpeech}
              </span>
            </div>
            
            <ol className="list-group list-group-numbered border-0 bg-transparent mb-3">
              {meaning.definitions.slice(0, 3).map((def, idx) => (
                <li key={idx} className="list-group-item bg-transparent border-0 ps-0 text-primary py-2 d-flex align-items-start justify-content-between">
                  <div className="flex-grow-1">
                    <span className="fs-5">{def.definition}</span>
                    {def.example && (
                      <div className="text-secondary italic mt-1 ps-3 border-start border-2 border-secondary" style={{ fontSize: '0.95rem' }}>
                        "{def.example}"
                      </div>
                    )}
                  </div>
                  <button 
                    className="btn btn-sm btn-link p-1 text-decoration-none" 
                    onClick={() => handleCopyDefinition(def.definition)}
                    title="Copy definition"
                  >
                    📋
                  </button>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {/* Synonyms & Antonyms */}
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="p-3 rounded h-100" style={{ background: 'rgba(99, 102, 241, 0.03)', border: '1px solid var(--card-border)' }}>
            <h5 className="mb-3">Synonyms</h5>
            {loadingSynonyms && <p className="text-muted">Loading synonyms...</p>}
            {!loadingSynonyms && synonyms.length === 0 && <p className="text-secondary italic fs-6">No synonyms found.</p>}
            <div className="d-flex flex-wrap gap-2">
              {synonyms.map((syn, idx) => (
                <span key={idx} className="badge bg-info text-dark py-2 px-3 fs-6" style={{ borderRadius: '20px' }}>
                  {syn}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="p-3 rounded h-100" style={{ background: 'rgba(99, 102, 241, 0.03)', border: '1px solid var(--card-border)' }}>
            <h5 className="mb-3">Antonyms</h5>
            {loadingAntonyms && <p className="text-muted">Loading antonyms...</p>}
            {!loadingAntonyms && antonyms.length === 0 && <p className="text-secondary italic fs-6">No antonyms found.</p>}
            <div className="d-flex flex-wrap gap-2">
              {antonyms.map((ant, idx) => (
                <span key={idx} className="badge bg-warning text-dark py-2 px-3 fs-6" style={{ borderRadius: '20px' }}>
                  {ant}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordResult;
