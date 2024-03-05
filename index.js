const express = require('express');
const cors = require('cors');
const validUrl = require('valid-url');
const shortid = require('shortid');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store mappings of short URLs to original URLs
const urlDatabase = {};

app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;

  // Check if the provided URL is valid
  if (!validUrl.isUri(url)) {
    return res.status(400).json({ error: 'invalid url' });
  }

  // Generate short URL
  const shortUrl = shortid.generate();

  // Store the mapping of short URL to original URL
  urlDatabase[shortUrl] = url;

  // Send JSON response with original and short URLs
  res.json({ original_url: url, short_url: shortUrl });
});

app.get('/api/shorturl/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;

  // Check if the provided short URL exists in the database
  if (!urlDatabase.hasOwnProperty(shortUrl)) {
    return res.status(404).json({ error: 'short url not found' });
  }

  // Redirect to the original URL associated with the short URL
  res.redirect(urlDatabase[shortUrl]);
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
