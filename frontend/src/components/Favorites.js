import React, { useState, useEffect } from 'react';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
    // Listen for storage changes
    const handleStorageChange = () => {
      loadFavorites();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadFavorites = () => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
  };

  const removeFromFavorites = (word) => {
    const updatedFavorites = favorites.filter(fav => fav !== word);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const clearFavorites = () => {
    if (window.confirm('Are you sure you want to clear all favorites?')) {
      setFavorites([]);
      localStorage.removeItem('favorites');
    }
  };

  return (
    <div className="mt-4">
      <h3 className="mb-3">❤️ Favorites</h3>
      
      {favorites.length === 0 ? (
        <div className="alert alert-info">
          <p className="mb-0">No favorites yet. Click "❤️ Add to Favorites" on any word to save it here.</p>
        </div>
      ) : (
        <>
          <div className="alert alert-light mb-3">
            <small><strong>{favorites.length}</strong> word(s) saved</small>
          </div>
          <ul className="list-group">
            {favorites.map((word, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <span style={{ fontSize: '1.1rem' }}>{word}</span>
                <button className="btn btn-danger btn-sm" onClick={() => removeFromFavorites(word)}>Remove</button>
              </li>
            ))}
          </ul>
          <button className="btn btn-warning mt-3" onClick={clearFavorites}>
            <svg width="16" height="16" fill="currentColor" className="bi bi-trash me-2" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
            </svg>
            Clear All Favorites
          </button>
        </>
      )}
    </div>
  );
};

export default Favorites;
