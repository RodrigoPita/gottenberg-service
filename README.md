# Gotenberg PDF Service for Songbook Builder

This is a self-hosted Gotenberg instance for generating PDFs from HTML.

## Local Testing

Run locally with Docker:
```bash
docker build -t gotenberg-local .
docker run -d -p 3000:3000 --name gotenberg-service gotenberg-local
```

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

## Deploy to Google Cloud Run

### Prerequisites
1. Install Google Cloud CLI: https://cloud.google.com/sdk/docs/install
2. Login to your Google account: `gcloud auth login`
3. Set your project: `gcloud config set project YOUR_PROJECT_ID`

### Deploy
```bash
# Build and deploy in one command
gcloud run deploy gotenberg-service \
  --source . \
  --platform managed \
  --region southamerica-east1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --timeout 300 \
  --set-env-vars API_KEY=your-secret-key-here
```

**Important**:
- Replace `your-secret-key-here` with a strong random string (e.g., use `openssl rand -hex 32`)
- The proxy runs on port 8080 and forwards to Gotenberg on port 3000
- Update `ALLOWED_ORIGINS` in [proxy.js](proxy.js) with your actual GitHub Pages URL

### Get Your URL
After deployment, you'll get a URL like:
`https://gotenberg-service-XXXXX.run.app`

Test it:
```bash
curl https://gotenberg-service-XXXXX.run.app/health
```

## Update Your React App

Set the environment variables in your songbook-builder:
```bash
# .env.production
VITE_GOTENBERG_URL=https://gotenberg-service-XXXXX.run.app
VITE_GOTENBERG_API_KEY=your-secret-key-here
```

Update your fetch requests to include the API key:
```javascript
const response = await fetch(`${import.meta.env.VITE_GOTENBERG_URL}/forms/chromium/convert/html`, {
  method: 'POST',
  headers: {
    'X-API-Key': import.meta.env.VITE_GOTENBERG_API_KEY
  },
  body: formData
});
```

## Security Configuration

Before deploying, update the allowed origins in [proxy.js](proxy.js):

```javascript
const ALLOWED_ORIGINS = [
  'https://your-username.github.io', // Replace with your actual GitHub Pages URL
  'http://localhost:5173', // For local development
  'http://localhost:4173'  // For local preview
];
```

## How It Works

1. **Proxy Layer**: Node.js proxy ([proxy.js](proxy.js)) receives requests on port 8080
2. **Validation**: Checks API key and origin/referer headers
3. **Forwarding**: Valid requests are proxied to Gotenberg on port 3000
4. **Response**: PDF is returned to the client with CORS headers

## Files
- [Dockerfile](Dockerfile) - Multi-stage build with Gotenberg + Node.js proxy
- [proxy.js](proxy.js) - Security middleware with API key and origin validation
- [package.json](package.json) - Node.js dependencies
- `.dockerignore` - Excludes unnecessary files from Docker build
- This README
