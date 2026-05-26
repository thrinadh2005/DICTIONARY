import React, { useState, useEffect } from 'react';

const WordOfTheDay = ({ onSearch }) => {
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    fetchWordOfTheDay();
  }, []);

  const fetchWordOfTheDay = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/wordoftheday');
      if (response.ok) {
        const data = await response.json();
        setWordData(data);
      } else {
        setError('Could not load today\'s word.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!wordData) return;
    const shareText = `✨ Word of the Day: "${wordData.word}"\n${wordData.partOfSpeech} — ${wordData.definition}${wordData.example ? `\n\nExample: "${wordData.example}"` : ''}\n\n📚 Lexicon Hub`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Word of the Day: ${wordData.word}`, text: shareText });
      } catch (_) {}
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      });
    }
  };

  // Skeleton shimmer while loading
  if (loading) {
    return (
      <div className="card border-0 glass-card p-4 mb-4 wotd-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="badge-category">✨ WORD OF THE DAY</span>
          <div className="skeleton-line" style={{ width: '90px', height: '14px' }} />
        </div>
        <div className="skeleton-line mb-2" style={{ width: '180px', height: '40px' }} />
        <div className="skeleton-line mb-3" style={{ width: '80px', height: '22px' }} />
        <div className="skeleton-line mb-2" style={{ width: '100%', height: '18px' }} />
        <div className="skeleton-line" style={{ width: '75%', height: '18px' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-0 glass-card p-4 mb-4 animate-fade-in">
        <div className="text-center py-2">
          <p className="text-secondary mb-3">{error}</p>
          <button className="btn btn-glass-secondary btn-sm" onClick={fetchWordOfTheDay}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (!wordData) return null;

  return (
    <div className="card border-0 glass-card p-4 mb-4 animate-fade-in wotd-card">
      {/* Header row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="badge-category">✨ WORD OF THE DAY</span>
        <small className="text-muted">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </small>
      </div>

      {/* Word + phonetic */}
      <div className="mb-2">
        <h2
          className="text-gradient mb-0 wotd-word"
          style={{ cursor: 'pointer', display: 'inline-block' }}
          onClick={() => onSearch(wordData.word)}
          title="Click to look up full definition"
        >
          {wordData.word}
        </h2>
        {wordData.phonetic && (
          <span className="ms-3 text-secondary font-monospace fs-6">{wordData.phonetic}</span>
        )}
      </div>

      {/* Part of speech */}
      <div className="mb-3">
        <span className="badge bg-secondary opacity-75 text-capitalize">{wordData.partOfSpeech}</span>
      </div>

      {/* Definition */}
      <p className="fs-5 mb-3" style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}>
        {wordData.definition}
      </p>

      {/* Example */}
      {wordData.example && (
        <figure className="border-start border-3 border-primary ps-3 py-1 mb-3">
          <blockquote className="blockquote mb-0 fs-6" style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            "{wordData.example}"
          </blockquote>
        </figure>
      )}

      {/* Synonyms + Antonyms chips */}
      {(wordData.synonyms?.length > 0 || wordData.antonyms?.length > 0) && (
        <div className="row g-2 mb-4">
          {wordData.synonyms?.length > 0 && (
            <div className="col-12 col-md-6">
              <p className="mb-1 text-secondary" style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Synonyms</p>
              <div className="d-flex flex-wrap gap-1">
                {wordData.synonyms.map((s, i) => (
                  <span
                    key={i}
                    className="badge"
                    style={{
                      background: 'rgba(99,102,241,0.12)',
                      color: 'var(--accent-primary)',
                      borderRadius: '20px',
                      padding: '0.35rem 0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.82rem'
                    }}
                    onClick={() => onSearch(s)}
                    title={`Look up "${s}"`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {wordData.antonyms?.length > 0 && (
            <div className="col-12 col-md-6">
              <p className="mb-1 text-secondary" style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Antonyms</p>
              <div className="d-flex flex-wrap gap-1">
                {wordData.antonyms.map((a, i) => (
                  <span
                    key={i}
                    className="badge"
                    style={{
                      background: 'rgba(239,68,68,0.1)',
                      color: '#ef4444',
                      borderRadius: '20px',
                      padding: '0.35rem 0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.82rem'
                    }}
                    onClick={() => onSearch(a)}
                    title={`Look up "${a}"`}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="d-flex gap-2 flex-wrap">
        <button
          className="btn btn-premium btn-sm px-3"
          onClick={() => onSearch(wordData.word)}
        >
          🔍 Full Definition
        </button>
        <button
          className="btn btn-glass-secondary btn-sm px-3"
          onClick={handleShare}
        >
          {shared ? '✅ Copied!' : '🔗 Share'}
        </button>
        <button
          className="btn btn-glass-secondary btn-sm px-3"
          onClick={fetchWordOfTheDay}
          title="Refresh word"
        >
          🔄 New Word
        </button>
      </div>
    </div>
  );
};

export default WordOfTheDay;
