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
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --timeout 300
```

### Get Your URL
After deployment, you'll get a URL like:
`https://gotenberg-service-XXXXX.run.app`

Test it:
```bash
curl https://gotenberg-service-XXXXX.run.app/health
```

## Update Your React App

Set the environment variable in your songbook-builder:
```bash
# .env.production
VITE_GOTENBERG_URL=https://gotenberg-service-XXXXX.run.app
```

## Files
- `Dockerfile` - Uses official Gotenberg image (gotenberg/gotenberg:8)
- `.dockerignore` - Excludes unnecessary files from Docker build
- This README
