const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// In-memory storage for URLs
let urlDatabase = [];
let shortUrlCounter = 1;

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Middleware to validate URL format using dns.lookup
function validateUrl(req, res, next) {
  const originalUrl = req.body.url;

  const urlRegex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.){1,}[a-zA-Z]{2,}(\S*)$/;
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  const urlWithoutProtocol = originalUrl.replace(/^(https?:\/\/)/, '');

  dns.lookup(urlWithoutProtocol, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    next();
  });
}

// URL shortener endpoint
app.post('/api/shorturl', validateUrl, function(req, res) {
  const originalUrl = req.body.url;

  // Create short URL and store in the database
  const shortUrl = shortUrlCounter++;
  urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });

  res.json({ original_url: originalUrl, short_url: shortUrl });
});

// Redirect to original URL when short URL is accessed
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url);
  const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrl);

  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'short url not found' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
