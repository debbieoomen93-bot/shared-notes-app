const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const http = require('http');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from React build in production
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fetch a URL and return the response body as a Buffer (follows redirects)
function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return resolve(fetchBuffer(response.headers.location));
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

// POST /api/generate-image
// Body: { title: string, content: string }
// Returns: raw image bytes (image/png)
app.post('/api/generate-image', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
  }

  const { title, content } = req.body || {};
  const noteTitle = (title || 'Untitled').substring(0, 120);
  const plainText = (content || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 350);

  const prompt = [
    `Create a beautiful, atmospheric illustration for a personal note.`,
    `Title: "${noteTitle}".`,
    plainText ? `The note is about: ${plainText}.` : '',
    `Style: painterly, cinematic mood, dramatic lighting, rich deep tones, highly detailed.`,
    `No text, no letters, no words, no UI elements.`,
  ].filter(Boolean).join(' ');

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
    });

    const imageUrl = response.data[0].url;
    const imageBuffer = await fetchBuffer(imageUrl);

    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);
  } catch (err) {
    console.error('Image generation error:', err?.message || err);
    res.status(500).json({ error: err?.message || 'Image generation failed' });
  }
});

// Catch-all: serve React app for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
