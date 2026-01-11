<div align="center">
<img width="1200" height="475" alt="StoryTime - Kids Picture Book Creator" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# StoryTime - Kids Picture Book Creator

A beautiful, interactive storybook creation app for children with AI-powered story translation and Firebase cloud sync.

## Features

- 📚 **Create Storybooks** - Beautiful picture book creator with custom illustrations
- 🌍 **Multi-Language** - Stories can be translated into 11 languages using AI
- 🔐 **Firebase Authentication** - Sign in with Email, Google, Facebook, or GitHub
- ☁️ **Cloud Sync** - Your stories are safely stored in the cloud
- ⭐ **Ratings** - Rate your favorite stories
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Authentication Providers

The app supports the following authentication methods:
- **Email/Password** - Traditional sign up and sign in
- **Google** - Quick sign in with Google account
- **Facebook** - Sign in with Facebook
- **GitHub** - Sign in with GitHub

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable Google Analytics (optional)

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - **Email/Password** - Enable "Email/Password" and "Email link (passwordless sign-in)"
   - **Google** - Enable and select your support email
   - **Facebook** - Create a Facebook App and enable the provider
   - **GitHub** - Create a GitHub OAuth App and enable the provider

### 3. Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Start in **Production mode** (recommended for live apps)
4. Select a location near your users

### 4. Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the web app (</> icon)
4. Copy the firebaseConfig object

### 5. Configure Environment Variables

Create a `.env` file in the project root with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Gemini API Key (for story translation)
GEMINI_API_KEY=your_gemini_api_key
```

### 6. Set Up Firestore Security Rules

In Firebase Console, go to **Firestore Database** → **Rules** and use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Public books collection for universal/shared stories
    match /books/{bookId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Run Locally

**Prerequisites:** Node.js (v18 or higher)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env` file

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder.

## Deploy to Firebase Hosting

### Option 1: Quick Deploy (using existing config)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase Hosting:
   ```bash
   firebase init
   # Select "Hosting" and "Use an existing project"
   # Select your Firebase project
   # What do you want to use as your public directory? dist
   # Configure as a single-page app? Yes
   # Set up automatic builds and deploys with GitHub? No (optional)
   ```

4. Deploy:
   ```bash
   firebase deploy
   ```

### Option 2: Direct Deploy

If you've already configured firebase.json:

```bash
firebase deploy
```

## Firestore Collection Structure

```
users/
  {userId}/
    email: string
    displayName: string
    photoURL: string
    createdAt: timestamp
    lastLogin: timestamp
    role: 'user' | 'admin'
    books/
      {bookId}/
        title: string
        author: string
        creatorName: string
        coverImage: string
        language: string
        ageGroup: number
        pages: array
        createdAt: timestamp
        publishStatus: 'local' | 'universal'

books/
  {bookId}/
    (Universal/shared books visible to everyone)
```

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **AI Translation**: Google Gemini API
- **Hosting**: Firebase Hosting

## License

MIT License - Feel free to use and modify for your own projects!

---

Made with ❤️ for young storytellers
