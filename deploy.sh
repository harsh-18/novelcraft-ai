#!/bin/bash

# Deployment script for NovelCraft AI
# This script deploys the application to Google Cloud Run and attaches the mandatory
# label required for the GenAI APAC AI Challenge scoring system.

echo "Starting deployment of NovelCraft AI to Google Cloud Run..."
echo "Applying required challenge label: dev-tutorial=cloud-run-ai-challenge"

gcloud run deploy novelcraft \
  --source . \
  --set-labels dev-tutorial=cloud-run-ai-challenge \
  --allow-unauthenticated

echo "Deployment complete!"
