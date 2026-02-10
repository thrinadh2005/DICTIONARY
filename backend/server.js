const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
app.get('/*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Dictionary Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API available at http://localhost:${PORT}/api`);
});

