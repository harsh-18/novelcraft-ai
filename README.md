# NovelCraft AI

An AI-powered web novel concept generator and interactive co-writing assistant. 

This project was built for the GenAI APAC AI Challenge. It leverages Google Cloud and Firebase to provide a secure, scalable, and context-aware storytelling tool for writers.

## Tech Stack
* **Frontend/Backend:** React & Vite (Node.js)
* **Authentication:** Firebase Authentication (Google Sign-In)
* **Database:** Cloud Firestore (User-isolated document storage)
* **AI Integration:** Gemini API (Multi-turn conversational context)
* **Hosting:** Google Cloud Run

## Deployment Steps
This application is containerized and deployed via Google Cloud Run. To deploy manually:

1. Ensure you have the Google Cloud CLI installed and authenticated.
2. Build and deploy the service using the following command:
   ```bash
   gcloud run deploy novelcraft \
     --source . \
     --set-labels dev-tutorial=cloud-run-ai-challenge \
     --allow-unauthenticated
   ```
