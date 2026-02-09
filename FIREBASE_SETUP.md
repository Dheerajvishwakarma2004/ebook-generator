# eBook Generator - Firebase Setup Guide

## Overview

This is a full-stack eBook generator with Firebase authentication, template marketplace, and revenue sharing system. Users can create, publish, and monetize custom ebook templates.

## Firebase Setup Instructions

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter your project name (e.g., "ebook-generator")
4. Continue through the setup process
5. Create a web app when prompted

### Step 2: Get Your Firebase Credentials

In Firebase Console:
1. Go to **Project Settings** (gear icon)
2. Click on your **Web App**
3. Copy all the configuration values:

```
API Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Domain: your-project.firebaseapp.com
Project ID: your-project-id
Storage Bucket: your-project.appspot.com
Messaging Sender ID: 123456789000
App ID: 1:123456789000:web:xxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Paste your Firebase credentials:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_USE_EMULATOR=false
```

### Step 4: Enable Firebase Services

In Firebase Console:

#### Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**

#### Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Start in **production mode** (or test mode for development)
4. Choose your location (nearest to users)

#### Security Rules
Replace Firestore rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Published templates are readable by all
    match /templates/{templateId} {
      allow read: if true;
      allow create, write, delete: if request.auth.uid == resource.data.creatorId;
    }

    // Template usage tracking
    match /templateUsage/{document=**} {
      allow create: if request.auth != null;
      allow read: if request.auth.uid == resource.data.userId || request.auth.uid == resource.data.creatorId;
    }

    // User projects (ebooks created from templates)
    match /userProjects/{projectId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }

    // Template suggestions
    match /templateSuggestions/{suggestionId} {
      allow read, write: if request.auth.uid == resource.data.suggestedByUserId || request.auth.uid == resource.data.creatorId;
      allow create: if request.auth != null;
    }
  }
}
```

## Features

### ✅ Implemented
- **Authentication**: Email/password signup and login
- **User Onboarding**: Account type selection (free/premium), bio setup
- **Dashboard**: View projects and templates
- **Template Creator**: Multi-step template builder
- **Template Publishing**: Set revenue share percentage and tags
- **Template Management**: Edit and publish templates
- **Firestore Schema**: Complete database structure for all features

### 🔄 In Development
- LaTeX code support for templates
- AI-powered template builder (premium)
- Template suggestions and approval system
- Revenue tracking and analytics
- Advanced template customization
- Template sharing and collaboration

## Database Schema

### Collections

#### `users`
User profiles with account info and earnings tracking.

```typescript
interface User {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  accountType: 'free' | 'premium'
  tier: 'creator' | 'standard' | 'premium'
  createdAt: number
  updatedAt: number
  bio?: string
  totalEarnings: number
}
```

#### `templates`
Published templates available in the marketplace.

```typescript
interface Template {
  id: string
  creatorId: string
  name: string
  description: string
  category: string
  coverStyle: string
  fonts: { heading: string; body: string }
  accentColor: string
  defaultContent: { title: string; author: string; chapters: [...] }
  isPublished: boolean
  usageCount: number
  revenuePercentage: number (0-100)
  tags: string[]
  createdAt: number
  updatedAt: number
  version: number
}
```

#### `userProjects`
Ebooks created by users using templates.

```typescript
interface UserProject {
  id: string
  userId: string
  templateId: string
  title: string
  author: string
  chapters: [...]
  customizations?: Record<string, any>
  createdAt: number
  updatedAt: number
  status: 'draft' | 'published'
}
```

#### `templateUsage`
Tracks every time a template is used (for revenue calculation).

```typescript
interface TemplateUsage {
  id: string
  templateId: string
  userId: string
  creatorId: string
  usedAt: number
  ebookTitle: string
}
```

## Project Structure

```
/app
  /onboarding       - First-time setup
  /login            - Sign in page
  /signup           - Sign up page
  /dashboard        - User projects & templates
  /template-builder - Create new templates
  /template/[id]/edit - Publish & manage template
  /editor           - eBook editor

/lib
  firebase.ts       - Firebase initialization
  auth.ts           - Authentication functions
  auth-context.tsx  - Auth state management
  firestore.ts      - Database operations
  types.ts          - TypeScript interfaces

/components
  - Template preview carousel
  - UI components (buttons, inputs, etc.)
```

## Running the App

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

Visit `http://localhost:3000`

## Next Steps

1. ✅ Set up Firebase project and enable services
2. ✅ Add environment variables to `.env.local`
3. ✅ Test authentication flow (signup → onboarding → dashboard)
4. ✅ Create your first template
5. 🔄 Implement LaTeX support
6. 🔄 Add AI template builder
7. 🔄 Set up revenue tracking dashboard
8. 🔄 Deploy to production

## Troubleshooting

**"Firebase is not initialized"**
- Check that all `NEXT_PUBLIC_FIREBASE_*` env vars are set
- Restart dev server after adding env vars

**"Permission denied" errors**
- Check Firestore security rules are correctly set
- Verify user is authenticated

**Templates not loading**
- Check Firestore database has `templates` collection
- Verify query limits in `firestore.ts`

## Support

For issues or questions, check:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- Project issues on GitHub
