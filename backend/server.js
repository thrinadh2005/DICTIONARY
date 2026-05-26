const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Word of the Day: Dynamic Random Word Cache ---
// Cache holds { date: 'YYYY-MM-DD', word, partOfSpeech, definition, example, phonetic, synonyms, antonyms }
let wotdCache = null;

// Diverse seed topics so Datamuse can return rich vocabulary
const WOTD_SEED_TOPICS = [
  'knowledge', 'wisdom', 'courage', 'beauty', 'nature', 'science',
  'history', 'language', 'philosophy', 'art', 'music', 'journey',
  'mystery', 'emotion', 'culture', 'freedom', 'justice', 'power',
  'growth', 'creativity', 'imagination', 'resilience', 'harmony'
];

// Fetch a random word with a real definition from public APIs
const fetchRandomWordOfTheDay = async () => {
  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

  // Return cached word if it's still today's
  if (wotdCache && wotdCache.date === today) {
    return wotdCache;
  }

  console.log(`🔄 Fetching new Word of the Day for ${today}...`);

  // Pick a random seed topic
  const seed = WOTD_SEED_TOPICS[Math.floor(Math.random() * WOTD_SEED_TOPICS.length)];

  // Step 1: Get a pool of related words from Datamuse (ml = "means like")
  const datamuseResp = await axios.get('https://api.datamuse.com/words', {
    params: { ml: seed, max: 200, md: 'p' }, // md=p returns parts of speech
    timeout: 5000
  });

  const candidates = (datamuseResp.data || []).filter(w =>
    w.word &&
    /^[a-z]+$/.test(w.word) &&       // letters only, no hyphens/spaces
    w.word.length >= 5 &&              // at least 5 chars
    w.word.length <= 14 &&             // not too long
    w.tags && w.tags.some(t => ['n', 'v', 'adj', 'adv'].includes(t)) // has POS
  );

  if (!candidates.length) throw new Error('No valid candidates from Datamuse');

  // Shuffle and try candidates until one resolves with a definition
  const shuffled = candidates.sort(() => Math.random() - 0.5);

  for (const candidate of shuffled.slice(0, 20)) {
    try {
      const defResp = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${candidate.word}`,
        { timeout: 4000 }
      );

      const entry = defResp.data?.[0];
      if (!entry) continue;

      const meaning = entry.meanings?.[0];
      const defObj  = meaning?.definitions?.[0];
      if (!defObj?.definition) continue;

      // Build enriched synonyms / antonyms from both the API and Datamuse tags
      const apiSynonyms  = (defObj.synonyms || []).slice(0, 6);
      const apiAntonyms  = (defObj.antonyms || []).slice(0, 4);

      wotdCache = {
        date: today,
        word: candidate.word,
        phonetic: entry.phonetic || '',
        partOfSpeech: meaning.partOfSpeech || '',
        definition: defObj.definition,
        example: defObj.example || '',
        synonyms: apiSynonyms,
        antonyms: apiAntonyms
      };

      console.log(`✅ Word of the Day: "${candidate.word}" (seed: ${seed})`);
      return wotdCache;
    } catch (_) {
      // This candidate had no definition — try next
    }
  }

  throw new Error('Could not resolve a definition for any candidate word');
};

// API Routes
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Translation endpoint (proxies to free Google Translate endpoint)
app.post('/api/translate', async (req, res) => {
  try {
    const { text, from = 'auto', to = 'es' } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Text parameter is required' });
    }

    const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
      params: {
        client: 'gtx',
        sl: from,
        tl: to,
        dt: 't',
        q: text
      },
      timeout: 6000
    });

    if (response.data && response.data[0]) {
      const translatedText = response.data[0].map(item => item[0]).join('');
      const detectedSource = response.data[2] || from;
      res.json({ translatedText, detectedSource });
    } else {
      throw new Error('Invalid response structure from translation service');
    }
  } catch (error) {
    console.error('Translation API error:', error.message);
    res.status(503).json({ error: 'Translation service is temporarily unavailable.' });
  }
});

// Search suggestions autocomplete (proxies to Datamuse API)
app.get('/api/suggestions/:word', async (req, res) => {
  try {
    const word = req.params.word;

    if (!word || word.trim() === '') {
      return res.status(400).json({ error: 'Word parameter is required' });
    }

    const response = await axios.get(`https://api.datamuse.com/sug?s=${encodeURIComponent(word)}`, {
      timeout: 4000
    });

    const suggestions = (response.data || []).map(item => item.word);
    res.json(suggestions);
  } catch (error) {
    console.error('Suggestions API error:', error.message);
    res.status(503).json({ error: 'Failed to fetch suggestions' });
  }
});

// Word of the Day endpoint — truly random, changes daily, cached in-memory
app.get('/api/wordoftheday', async (req, res) => {
  try {
    const wordObj = await fetchRandomWordOfTheDay();
    res.json(wordObj);
  } catch (error) {
    console.error('Word of the Day error:', error.message);
    // Graceful fallback so the UI is never empty
    res.json({
      date: new Date().toISOString().split('T')[0],
      word: 'serendipity',
      phonetic: '/ˌserənˈdɪpɪti/',
      partOfSpeech: 'noun',
      definition: 'The occurrence and development of events by chance in a happy or beneficial way.',
      example: 'A fortunate stroke of serendipity brought the two scientists together.',
      synonyms: ['luck', 'fortune', 'chance', 'coincidence'],
      antonyms: ['misfortune', 'design']
    });
  }
});

// Route to get word definition
app.get('/api/define/:word', async (req, res) => {
  try {
    const word = req.params.word;

    if (!word || word.trim() === '') {
      return res.status(400).json({ error: 'Word parameter is required' });
    }

    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, {
      timeout: 5000
    });

    res.json(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'Word not found' });
    } else {
      console.error('Error fetching definition:', error.message);
      res.status(503).json({ error: 'Unable to fetch definition. Please try again later.' });
    }
  }
});

// Route to get synonyms
app.get('/api/synonyms/:word', async (req, res) => {
  try {
    const word = req.params.word;

    if (!word || word.trim() === '') {
      return res.status(400).json({ error: 'Word parameter is required' });
    }

    const response = await axios.get(`https://api.datamuse.com/words?rel_syn=${word}`, {
      timeout: 5000
    });

    res.json(response.data || []);
  } catch (error) {
    console.error('Error fetching synonyms:', error.message);
    res.status(503).json({ error: 'Error fetching synonyms', data: [] });
  }
});

// Route to get antonyms
app.get('/api/antonyms/:word', async (req, res) => {
  try {
    const word = req.params.word;

    if (!word || word.trim() === '') {
      return res.status(400).json({ error: 'Word parameter is required' });
    }

    const response = await axios.get(`https://api.datamuse.com/words?rel_ant=${word}`, {
      timeout: 5000
    });

    res.json(response.data || []);
  } catch (error) {
    console.error('Error fetching antonyms:', error.message);
    res.status(503).json({ error: 'Error fetching antonyms', data: [] });
  }
});

// Serve frontend build in production
const frontendBuildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(frontendBuildPath));

// Catch-all route to serve the frontend for any other requests
// Using regex literal for total compatibility with Express 5+
app.get(/.*/, (req, res) => {
  console.log(`🌐 Catch-all: serving index.html for ${req.url}`);
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Dictionary Server starting up...`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API available at http://localhost:${PORT}/api`);
});

