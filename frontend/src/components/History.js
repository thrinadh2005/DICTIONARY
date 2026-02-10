import React, { useState, useEffect } from 'react';

const History = ({ onSearch }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
    // Listen for storage changes
    const handleStorageChange = () => {
      loadHistory();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadHistory = () => {
    const storedHistory = JSON.parse(localStorage.getItem('history')) || [];
    setHistory(storedHistory);
  };

  const removeFromHistory = (word) => {
    const updatedHistory = history.filter(h => h !== word);
    setHistory(updatedHistory);
    localStorage.setItem('history', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your search history?')) {
      setHistory([]);
      localStorage.removeItem('history');
    }
  };

  return (
    <div className="mt-4">
      <h3 className="mb-3">📚 Search History</h3>
      {history.length === 0 ? (
        <div className="alert alert-info">
          <p className="mb-0">No search history yet. Start searching words!</p>
        </div>
      ) : (
        <>
          <div className="alert alert-light mb-3">
            <small><strong>{history.length}</strong> search(es) performed</small>
          </div>
          <ul className="list-group">
            {history.map((word, index) => (
              <li 
                key={index} 
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <button 
                  className="btn btn-link text-decoration-none text-start flex-grow-1"
                  onClick={() => onSearch(word)}
                  style={{ cursor: 'pointer', fontSize: '1.05rem' }}
                >
                  {word}
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromHistory(word)}>
                  <svg width="14" height="14" fill="currentColor" className="bi bi-x-circle me-1" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button className="btn btn-warning mt-3" onClick={clearHistory}>🗑️ Clear History</button>
        </>
      )}
    </div>
  );
};

export default History;
