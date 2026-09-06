# NovelCraft AI

An AI-powered web novel concept generator and interactive co-writing assistant. 

This project was built for the GenAI APAC AI Challenge. It leverages Google Cloud and Firebase to provide a secure, scalable, and context-aware storytelling tool for writers.

## Tech Stack
* **Frontend/Backend:** React & Vite (Node.js)
* **Authentication:** Firebase Authentication (Google Sign-In)
* **Database:** Cloud Firestore (User-isolated document storage)
* **AI Integration:** Gemini API (Multi-turn conversational context)
* **Hosting:** Google Cloud Run

## Environment Configuration
To reproduce this locally or deploy it, you will need to set up the following environment variables. These are used securely and never hardcoded in source control:

```env
GEMINI_API_KEY="your-gemini-api-key"

# Firebase Project Configuration
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
VITE_FIREBASE_DATABASE_ID="your-firestore-db-id"
```

## Firestore Security Rules
The application relies on the following rigorous Cloud Firestore security rules to guarantee that database reads/writes are exclusively scoped to the authenticated user's UID (preventing unauthorized access):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /concepts/{conceptId} {
      allow read, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Deployment Steps
This application is containerized and deployed via Google Cloud Run. The deployment command includes the mandatory tracking label `dev-tutorial=cloud-run-ai-challenge` required by the scoring system.

To deploy, simply authenticate your Google Cloud CLI and run the included npm script:

```bash
npm run deploy
```

Alternatively, you can manually execute the provided deployment script or the raw `gcloud` command:
```bash
./deploy.sh
# OR
gcloud run deploy novelcraft \
  --source . \
  --set-labels dev-tutorial=cloud-run-ai-challenge \
  --allow-unauthenticated
```
