import React, { useState, useEffect, useRef } from 'react';

const SearchBar = ({ onSearch }) => {
  const [word, setWord] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setWord(value);
    setActiveIndex(-1);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.trim().length > 0) {
      debounceTimer.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/suggestions/${encodeURIComponent(value.trim())}`);
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      }, 250);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalWord = activeIndex >= 0 && suggestions[activeIndex] ? suggestions[activeIndex] : word;
    if (finalWord.trim()) {
      onSearch(finalWord.trim());
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    setWord(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 position-relative" onKeyDown={handleKeyDown}>
      <div className="input-group">
        <input
          type="text"
          className="form-control form-control-lg border-0 shadow-sm"
          placeholder="Type a word to search (e.g., resilient, serendipity)..."
          value={word}
          onChange={handleChange}
          onFocus={() => word.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
          autoComplete="off"
        />
        <button className="btn btn-premium px-4" type="submit">
          🔍 Search
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="list-group suggestions-dropdown position-absolute w-100 mt-1" style={{ top: '100%', zIndex: 1000 }}>
          {suggestions.slice(0, 6).map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              className={`suggestion-item ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => selectSuggestion(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </form>
  );
};

export default SearchBar;
