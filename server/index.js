require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const createPersona = require('./create-persona');
const path = require('path');

const app = express();
app.use(bodyParser.json());
// Serve project root static files so index.html and personas.html are accessible
app.use(express.static(path.join(__dirname, '..')));

app.post('/api/generate-persona', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const result = await createPersona.generateAndPublish(prompt);
    res.json(result);
  } catch (err) {
    console.error('Error in /api/generate-persona', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
