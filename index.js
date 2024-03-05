require('dotenv').config();
const express = require('express');
const cors = require('cors');
const validUrl = require('valid-url');
const shortid = require('shortid');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

const urlDatabase = {};

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Check if the URL is valid
  if (!validUrl.isWebUri(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Generate short URL
  const shortUrl = shortid.generate();

  // Save original and short URLs to database
  urlDatabase[shortUrl] = originalUrl;

  res.json({ original_url: originalUrl, short_url: shortUrl });
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = req.params.short_url;
  
  // Check if the short URL exists in the database
  if (!urlDatabase.hasOwnProperty(shortUrl)) {
    return res.json({ error: 'invalid short url' });
  }

  // Redirect to the original URL
  res.redirect(urlDatabase[shortUrl]);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
