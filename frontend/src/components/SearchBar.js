import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [word, setWord] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sample words for suggestions
  const commonWords = [
    'hello', 'world', 'dictionary', 'search', 'definition', 'synonyms',
    'antonyms', 'word', 'language', 'english', 'grammar', 'vocabulary',
    'peace', 'joy', 'love', 'knowledge', 'wisdom', 'learn'
  ];

  const handleChange = (e) => {
    const value = e.target.value.toLowerCase();
    setWord(value);

    if (value.length > 0) {
      const filtered = commonWords.filter(w => w.includes(value));
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (word.trim()) {
      onSearch(word.trim());
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    setWord(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="input-group position-relative">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="Enter a word to search..."
          value={word}
          onChange={handleChange}
          onFocus={() => word.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        <button className="btn btn-primary btn-lg" type="submit">🔍 Search</button>

        {showSuggestions && suggestions.length > 0 && (
          <div className="list-group position-absolute w-100 mt-1" style={{ top: '100%', zIndex: 1000 }}>
            {suggestions.slice(0, 6).map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                className="list-group-item list-group-item-action"
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
