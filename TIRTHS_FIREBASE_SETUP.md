# 48 Kos Tirths - Firebase Setup Guide

## Overview
This guide explains how to set up Firebase Firestore for storing and syncing 182 tirths data with offline-first functionality.

## Firebase Setup

### 1. Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project or create a new one
3. Enable **Firestore Database**
4. Choose **Start in test mode** (we'll add security rules later)

### 2. Firestore Collection Structure
Create a collection named `tirths` with the following document structure:

```json
{
  "id": "tirth_001",
  "name": "Golden Temple",
  "description": "The holiest shrine of Sikhism, located in Amritsar...",
  "location": {
    "address": "Golden Temple Road, Amritsar",
    "city": "Amritsar",
    "state": "Punjab",
    "country": "India",
    "coordinates": {
      "latitude": 31.6200,
      "longitude": 74.8765
    }
  },
  "images": {
    "main": "https://example.com/golden-temple-main.jpg",
    "gallery": [
      "https://example.com/golden-temple-1.jpg",
      "https://example.com/golden-temple-2.jpg"
    ]
  },
  "details": {
    "significance": "Spiritual center of Sikhism",
    "history": "Built in 1588 by Guru Arjan Dev...",
    "timings": "Open 24/7",
    "entryFee": 0,
    "facilities": ["Parking", "Food", "Accommodation"],
    "bestTimeToVisit": "October to March"
  },
  "contact": {
    "phone": "+91-183-2553957",
    "email": "info@goldentemple.com",
    "website": "https://goldentemple.com"
  },
  "category": "gurudwara",
  "tags": ["Sikh", "Golden", "Amritsar", "Punjab"],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 3. Data Categories
The tirths are categorized as:
- `temple` - Hindu temples
- `gurudwara` - Sikh gurudwaras
- `mosque` - Islamic mosques
- `church` - Christian churches
- `historical` - Historical monuments
- `natural` - Natural sacred sites

### 4. Sample Data Structure
Each tirth document should include:

#### Required Fields:
- `id` (string) - Unique identifier
- `name` (string) - Tirth name
- `description` (string) - Brief description
- `location` (object) - Address and coordinates
- `images` (object) - Main image and gallery
- `category` (string) - One of the categories above
- `tags` (array) - Searchable tags
- `isActive` (boolean) - Whether tirth is active
- `createdAt` (timestamp) - Creation date
- `updatedAt` (timestamp) - Last update date

#### Optional Fields:
- `details` (object) - Additional information
- `contact` (object) - Contact information
- `entryFee` (number) - Entry fee if applicable

### 5. Firestore Security Rules
Add these security rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to tirths collection
    match /tirths/{document} {
      allow read: if true; // Public read access
      allow write: if false; // No write access from app (admin only)
    }
  }
}
```

### 6. Data Upload Methods

#### Option A: Firebase Console (Manual)
1. Go to Firestore Database in Firebase Console
2. Click "Start collection"
3. Collection ID: `tirths`
4. Add documents manually with the structure above

#### Option B: Firebase Admin SDK (Bulk Upload)
Create a Node.js script to upload all 182 tirths:

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

### 7. Image Storage
For high-quality images, use Firebase Storage:

1. Create a Storage bucket in Firebase Console
2. Upload images to `tirths/{tirthId}/` folder
3. Update image URLs in Firestore documents
4. Images will be cached automatically by the app

### 8. Performance Optimization

#### Firestore Indexes
Create composite indexes for better query performance:

```javascript
// For category filtering
collection: tirths
fields: isActive (Ascending), category (Ascending)

// For location-based queries
collection: tirths
fields: isActive (Ascending), location.city (Ascending)
```

#### Data Size Considerations
- Keep descriptions under 500 characters for list view
- Use compressed images (max 1MB per image)
- Limit gallery images to 5-10 per tirth
- Total document size should be under 1MB

### 9. Offline-First Strategy
The app implements a robust offline-first approach:

#### First Launch (48 Kos Tab)
- **Automatic Download**: When user first opens 48 Kos tab, all 182 tirths are downloaded from Firebase
- **Local Storage**: Data is stored in device memory using AsyncStorage
- **User Feedback**: Shows "Downloading 182 tirths..." status
- **Error Handling**: If download fails, shows error message and requires internet connection

#### Subsequent Launches
- **Local Data**: Always loads from local storage (works offline)
- **Background Sync**: Checks for updates every 24 hours when online
- **Seamless Experience**: No loading delays, instant access to all tirths
- **Network Independent**: Full functionality without internet connection

#### Key Features
- **Offline-First**: App works completely offline after first download
- **High Performance**: No network delays for browsing/searching
- **Data Persistence**: Data survives app restarts and device reboots
- **Automatic Updates**: Periodic sync when internet is available
- **Error Recovery**: Graceful handling of network issues

### 10. Monitoring
Set up Firebase Analytics to track:
- Sync frequency
- Offline usage
- Search patterns
- Popular tirths

## Testing the Offline-First Implementation

### Test First Launch
1. Clear app data or use test utilities:
   ```javascript
   import TirthTestUtils from './src/utils/tirthTestUtils';
   await TirthTestUtils.resetToFirstLaunch();
   ```
2. Open 48 Kos tab
3. Verify "Downloading 182 tirths..." message appears
4. Check console logs for download progress
5. Verify all tirths load after download completes

### Test Offline Functionality
1. After first download, turn off internet
2. Open 48 Kos tab
3. Verify all tirths load instantly from local storage
4. Test search and filtering (should work offline)
5. Verify "Offline" status indicator

### Test Periodic Sync
1. Wait 24 hours or manually trigger sync
2. Turn on internet
3. Open 48 Kos tab
4. Verify "Syncing..." message appears briefly
5. Check console logs for sync activity

## Next Steps
1. Set up Firebase project
2. Create Firestore collection
3. Upload sample data (5-10 tirths)
4. Test first launch behavior
5. Test offline functionality
6. Upload all 182 tirths
7. Monitor performance and usage

## Support
For issues or questions, refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Firebase](https://rnfirebase.io/)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
