# Firebase Firestore Setup Guide for 48 Kos Tirths

## Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**
   - Click "Create a project" or "Add project"
   - Enter project name: `kdb-revamp-tirths` (or your preferred name)
   - Click "Continue"

3. **Configure Google Analytics** (Optional)
   - Choose whether to enable Google Analytics
   - Select or create an Analytics account
   - Click "Create project"

4. **Wait for Project Creation**
   - Firebase will create your project
   - Click "Continue" when ready

## Step 2: Enable Firestore Database

1. **Navigate to Firestore**
   - In the left sidebar, click "Firestore Database"
   - Click "Create database"

2. **Choose Security Rules**
   - Select "Start in test mode" (we'll secure it later)
   - Click "Next"

3. **Choose Location**
   - Select a location closest to your users (e.g., `asia-south1` for India)
   - Click "Done"

4. **Wait for Database Creation**
   - Firestore will be created and ready to use

## Step 3: Configure Firestore Security Rules

1. **Go to Rules Tab**
   - In Firestore Database, click "Rules" tab
   - Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to tirths collection
    match /tirths/{document} {
      allow read: if true; // Public read access for app
      allow write: if false; // No write access from app (admin only)
    }
  }
}
```

2. **Publish Rules**
   - Click "Publish" to save the rules

## Step 4: Create Tirths Collection

1. **Start Collection**
   - Click "Start collection"
   - Collection ID: `tirths`
   - Click "Next"

2. **Add First Document** (Sample)
   - Document ID: `tirth_001`
   - Add fields:

| Field | Type | Value |
|-------|------|-------|
| `id` | string | `tirth_001` |
| `name` | string | `Golden Temple` |
| `description` | string | `The holiest shrine of Sikhism, located in Amritsar, Punjab.` |
| `location` | map | `{address: "Golden Temple Road, Amritsar", city: "Amritsar", state: "Punjab", country: "India"}` |
| `images` | map | `{main: "https://example.com/golden-temple.jpg", gallery: ["https://example.com/golden-temple-1.jpg"]}` |
| `category` | string | `gurudwara` |
| `tags` | array | `["Sikh", "Golden", "Amritsar", "Punjab"]` |
| `isActive` | boolean | `true` |
| `createdAt` | timestamp | `2024-01-01T00:00:00Z` |
| `updatedAt` | timestamp | `2024-01-01T00:00:00Z` |

3. **Save Document**
   - Click "Save" to create the first document

## Step 5: Set Up Firebase Storage (for Images)

1. **Navigate to Storage**
   - In the left sidebar, click "Storage"
   - Click "Get started"

2. **Choose Security Rules**
   - Select "Start in test mode"
   - Click "Next"

3. **Choose Location**
   - Select the same location as Firestore
   - Click "Done"

4. **Configure Storage Rules**
   - Go to "Rules" tab
   - Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /tirths/{allPaths=**} {
      allow read: if true; // Public read access for images
      allow write: if false; // No write access from app
    }
  }
}
```

5. **Publish Rules**
   - Click "Publish"

## Step 6: Get Firebase Configuration

1. **Go to Project Settings**
   - Click the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"

2. **Get Web App Config**
   - Scroll down to "Your apps" section
   - Click "Add app" and select "Web" (</>) icon
   - App nickname: `kdb-revamp-web`
   - Click "Register app"

3. **Copy Configuration**
   - Copy the Firebase configuration object
   - It should look like:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## Step 7: Update Your App Configuration

1. **Update Firebase Config**
   - The configuration is already in your `google-services.json` and `GoogleService-Info.plist`
   - No additional changes needed for React Native Firebase

2. **Verify Firebase Connection**
   - Your app should now be able to connect to Firestore
   - Test by running the app and checking console logs

## Step 8: Upload Sample Data

### Option A: Manual Upload (5-10 tirths for testing)

1. **Add More Documents**
   - In Firestore, click "Add document"
   - Use the same structure as the first document
   - Add 5-10 sample tirths for testing

### Option B: Bulk Upload Script (for all 182 tirths)

1. **Create Upload Script**
   - Create a Node.js script to upload all tirths
   - Use Firebase Admin SDK

2. **Sample Upload Script**:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadTirths() {
  const tirthsData = require('./tirths-data.json'); // Your 182 tirths data
  
  for (const tirth of tirthsData) {
    await db.collection('tirths').doc(tirth.id).set({
      ...tirth,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
  }
  
  console.log('All tirths uploaded successfully!');
}

uploadTirths();
```

## Step 9: Test the Setup

1. **Run Your App**
   - Start the React Native app
   - Navigate to 48 Kos tab

2. **Check Console Logs**
   - Look for Firebase connection logs
   - Verify data download on first launch

3. **Test Offline Functionality**
   - After first download, turn off internet
   - Verify app works offline

## Step 10: Monitor and Maintain

1. **Set Up Monitoring**
   - Enable Firebase Analytics
   - Monitor Firestore usage
   - Track download success rates

2. **Regular Maintenance**
   - Update tirths data as needed
   - Monitor storage usage
   - Review security rules periodically

## Troubleshooting

### Common Issues:

1. **"Permission denied" error**
   - Check Firestore security rules
   - Ensure rules allow read access

2. **"Network error"**
   - Check internet connection
   - Verify Firebase project configuration

3. **"Collection not found"**
   - Ensure collection name is exactly `tirths`
   - Check if collection exists in Firestore console

4. **"Document not found"**
   - Verify document structure matches expected format
   - Check field names and types

### Support Resources:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [React Native Firebase](https://rnfirebase.io/)

## Next Steps

1. ✅ Create Firebase project
2. ✅ Enable Firestore Database
3. ✅ Set up security rules
4. ✅ Create tirths collection
5. ✅ Upload sample data (5-10 tirths)
6. ✅ Test app functionality
7. ⏳ Upload all 182 tirths
8. ⏳ Monitor performance

Your Firebase Firestore is now ready for the 48 Kos tirths data!
