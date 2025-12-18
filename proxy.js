const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server
const GOTENBERG_TARGET = process.env.GOTENBERG_URL || 'http://localhost:3000';
const proxy = httpProxy.createProxyServer({
  target: GOTENBERG_TARGET,
  changeOrigin: true
});

// Configuration
const ALLOWED_ORIGINS = [
  'https://rodrigopita.github.io',
  'http://localhost:5173', // For local development
  'http://localhost:4173'  // For local preview
];
const API_KEY = process.env.API_KEY || 'your-default-secret-key';
const PORT = process.env.PORT || 8080;

// Create server with validation
const server = http.createServer((req, res) => {
  // Set CORS headers
  const origin = req.headers.origin;

  // Check if origin is allowed
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check endpoint (no auth needed)
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'gotenberg-proxy' }));
    return;
  }

  // Validate API Key
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== API_KEY) {
    console.log(`Unauthorized request from ${origin || 'unknown'} - Invalid API key`);
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }

  // Validate Origin or Referer
  const referer = req.headers.referer || req.headers.referrer;
  const isValidOrigin = origin && ALLOWED_ORIGINS.includes(origin);
  const isValidReferer = referer && ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed));

  if (!isValidOrigin && !isValidReferer) {
    console.log(`Forbidden request from origin: ${origin}, referer: ${referer}`);
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Forbidden - Invalid origin' }));
    return;
  }

  // Log successful request
  console.log(`Proxying request from ${origin || referer} to Gotenberg`);

  // Proxy the request to Gotenberg
  proxy.web(req, res, (err) => {
    console.error('Proxy error:', err);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Bad Gateway' }));
  });
});

server.listen(PORT, () => {
  console.log(`Gotenberg proxy listening on port ${PORT}`);
  console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
});
