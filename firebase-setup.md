# Firebase Setup Guide for KDB Revamp

## 🔥 Required Firebase Services

### 1. **Firestore Database** ✅
- **Status**: Needs to be enabled
- **Collections**: `stallApplications`, `stallCategories`
- **Rules**: Allow authenticated users to read/write

### 2. **Cloud Storage** ✅
- **Status**: Needs to be enabled
- **Bucket**: `kdbrevampnew.firebasestorage.app`
- **Rules**: Allow authenticated users to upload files

### 3. **Authentication** ✅
- **Status**: Already configured
- **Methods**: Email/Password, Phone (OTP)

## 📋 Step-by-Step Setup

### Step 1: Enable Firestore
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `kdbrevampnew`
3. Go to **Firestore Database**
4. Click **"Create database"**
5. Choose **"Start in test mode"**
6. Select location: `asia-south1` (Mumbai)
7. Click **"Done"**

### Step 2: Enable Storage
1. Go to **Storage**
2. Click **"Get started"**
3. Choose **"Start in test mode"**
4. Select location: `asia-south1` (Mumbai)
5. Click **"Done"**

### Step 3: Set Security Rules

#### Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /stallApplications/{document} {
      allow read, write: if request.auth != null;
    }
    match /stallCategories/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

#### Storage Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /stallApplications/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 4: Create Sample Data

#### Add Stall Categories:
1. Go to **Firestore Database > Data**
2. Click **"Start collection"**
3. Collection ID: `stallCategories`
4. Add these documents:

**Document 1:**
- Document ID: `food-beverages`
- Fields:
  - `name`: "Food & Beverages"
  - `description`: "Restaurants, food stalls, beverages"
  - `isActive`: true
  - `createdAt`: 2024-01-01T00:00:00Z

**Document 2:**
- Document ID: `handicrafts`
- Fields:
  - `name`: "Handicrafts & Art"
  - `description`: "Traditional handicrafts, artwork, souvenirs"
  - `isActive`: true
  - `createdAt`: 2024-01-01T00:00:00Z

**Document 3:**
- Document ID: `clothing`
- Fields:
  - `name`: "Clothing & Accessories"
  - `description`: "Traditional wear, jewelry, accessories"
  - `isActive`: true
  - `createdAt`: 2024-01-01T00:00:00Z

## ✅ Verification

After setup, your app should be able to:
1. ✅ Authenticate users
2. ✅ Read stall categories from Firestore
3. ✅ Submit stall applications to Firestore
4. ✅ Upload files to Storage (currently using mock files)

## 🚨 Important Notes

- **Test Mode**: Rules are set to allow all reads/writes for development
- **Production**: Update rules to be more restrictive before going live
- **Mock Files**: Currently using mock file uploads for development
- **Real Files**: Uncomment real upload code in `FirebaseService.ts` for production

## 📱 Testing

1. Run the app
2. Go to Stalls section
3. Try to submit an application
4. Check Firestore console to see if data is saved
5. Check console logs for any errors
