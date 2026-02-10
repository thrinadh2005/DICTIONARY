import React, { useState, useEffect } from 'react';
import * as dbUtils from '../utils/dbUtils';

const WordResult = ({ wordData }) => {
  const [synonyms, setSynonyms] = useState([]);
  const [antonyms, setAntonyms] = useState([]);
  const [loadingSynonyms, setLoadingSynonyms] = useState(false);
  const [loadingAntonyms, setLoadingAntonyms] = useState(false);

  useEffect(() => {
    if (wordData && wordData[0]) {
      const word = wordData[0].word;
      fetchSynonyms(word);
      fetchAntonyms(word);
    }
  }, [wordData]);

  const fetchSynonyms = async (word) => {
    setLoadingSynonyms(true);
    try {
      const response = await fetch(`http://localhost:5000/api/synonyms/${word}`);
      if (response.ok) {
        const data = await response.json();
        const synonymList = data.slice(0, 5).map(item => item.word);
        setSynonyms(synonymList);
        await dbUtils.saveSynonyms(word, synonymList);
      }
    } catch (error) {
      // Try to get from cache
      const cachedData = await dbUtils.getSynonyms(word);
      if (cachedData) {
        setSynonyms(cachedData);
      }
    }
    setLoadingSynonyms(false);
  };

  const fetchAntonyms = async (word) => {
    setLoadingAntonyms(true);
    try {
      const response = await fetch(`http://localhost:5000/api/antonyms/${word}`);
      if (response.ok) {
        const data = await response.json();
        const antonymList = data.slice(0, 5).map(item => item.word);
        setAntonyms(antonymList);
        await dbUtils.saveAntonyms(word, antonymList);
      }
    } catch (error) {
      // Try to get from cache
      const cachedData = await dbUtils.getAntonyms(word);
      if (cachedData) {
        setAntonyms(cachedData);
      }
    }
    setLoadingAntonyms(false);
  };

  if (!wordData || !wordData[0]) return null;

  const word = wordData[0];
  const phonetics = word.phonetics.find(p => p.audio) || word.phonetics[0];
  const meanings = word.meanings[0];
  const definition = meanings.definitions[0];

  const addToFavorites = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(word.word)) {
      favorites.push(word.word);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      alert('✓ Added to favorites!');
    } else {
      alert('Already in favorites!');
    }
  };

  return (
    <div className="card mt-3 border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="card-title mb-1">{word.word}</h2>
            {phonetics && phonetics.text && <p className="text-muted mb-0"><em>{phonetics.text}</em></p>}
          </div>
          <button className="btn btn-outline-primary" onClick={addToFavorites}>❤️ Add to Favorites</button>
        </div>
        
        {phonetics && phonetics.audio && (
          <button className="btn btn-secondary btn-sm mb-3" onClick={() => {
            try {
              new Audio(phonetics.audio).play();
            } catch (err) {
              console.error('Error playing audio:', err);
            }
          }}>
            <svg width="16" height="16" fill="currentColor" className="bi bi-volume-up me-2" viewBox="0 0 16 16">
              <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
              <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.707.707z"/>
              <path d="M10.025 8a4.486 4.486 0 0 1-1.318-3.182L8 5.536l-.707-.707A4.486 4.486 0 0 1 6 8c0 .746.295 1.436.78 1.96l.707-.707A3.498 3.498 0 0 0 7.025 8c0-.966.392-1.841 1.002-2.54l.707.707zm-7.96-4.203-.707-.707 12.5 12.5.707.707L2.064 3.797z"/>
            </svg>
            Play Pronunciation
          </button>
        )}
        
        <hr />
        
        <div className="mb-3">
          <h5><strong>Definition</strong></h5>
          <p className="lead">{definition.definition}</p>
          {definition.example && <p><em>"<strong>{definition.example}</strong>"</em></p>}
        </div>

        {loadingSynonyms && <p className="text-muted">Loading synonyms...</p>}
        {synonyms.length > 0 && (
          <div className="mb-3">
            <h5><strong>Synonyms</strong></h5>
            <div className="d-flex flex-wrap gap-2">
              {synonyms.map((syn, idx) => (
                <span key={idx} className="badge bg-info text-dark">{syn}</span>
              ))}
            </div>
          </div>
        )}

        {loadingAntonyms && <p className="text-muted">Loading antonyms...</p>}
        {antonyms.length > 0 && (
          <div className="mb-3">
            <h5><strong>Antonyms</strong></h5>
            <div className="d-flex flex-wrap gap-2">
              {antonyms.map((ant, idx) => (
                <span key={idx} className="badge bg-warning text-dark">{ant}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordResult;
