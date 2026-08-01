# FCM Reminders Setup Guide

This guide explains how to set up Firebase Cloud Messaging (FCM) for reminder notifications.

## App Changes Completed

✅ Added `@react-native-firebase/messaging` to package.json
✅ Created FCMService for token registration
✅ Updated ReminderService to store reminders in Firestore (removed local scheduling)
✅ Updated App.tsx with FCM foreground/background handlers
✅ Updated AuthNavigationListener to register FCM tokens on login

## Next Steps

### 1. Install FCM Package

```bash
npm install
# For iOS
cd ios && pod install && cd ..
```

### 2. Test FCM First (Before Cloud Functions)

**IMPORTANT**: Before setting up Cloud Functions, test that FCM works:

1. Run the app and log in
2. FCM token will be automatically registered (stored in `users/{uid}/fcmToken` in Firestore)
3. Go to Firebase Console → Cloud Messaging → Send test message
4. Copy the FCM token from Firestore and paste it in the test message
5. Send - you should receive notification on device ✅

If this works, FCM is properly configured! Then proceed to Cloud Functions.

### 3. Setup Cloud Functions (REQUIRED for Scheduled Reminders)

**Why needed**: FCM can't schedule notifications - it only sends immediately. Cloud Functions checks Firestore every 5 minutes and sends FCM when reminders are due.

#### A. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

#### B. Initialize Functions (if not already done)

```bash
firebase init functions
# When prompted:
# - Select JavaScript or TypeScript (JavaScript is simpler)
# - Select your Firebase project
# - Use ESLint: No (or Yes if you want)
# - Install dependencies: Yes
```

#### C. Setup the Reminder Scheduler Function

1. Copy the reminder scheduler code:

```bash
# Copy reminder-scheduler.js content to functions/index.js
cp functions/reminder-scheduler.js functions/index.js
```

2. Install dependencies in the `functions` folder:

```bash
cd functions
npm install firebase-functions firebase-admin
cd ..
```

**Note**: These dependencies (`firebase-functions` and `firebase-admin`) go in `functions/package.json`, NOT in the main app `package.json`. When you run `firebase init functions`, it will create a separate `functions/package.json` file.

#### D. Deploy Firestore Indexes (REQUIRED)

The Cloud Function uses a `collectionGroup` query that requires a composite index:

```bash
firebase deploy --only firestore:indexes
```

**OR** create manually in Firebase Console:
- Go to Firestore → Indexes → Create Index
- Collection ID: `reminders` (collection group)
- Fields: `status` (Asc), `notifyAtUTC` (Asc), `fcmSent` (Asc)

Wait for index to build (usually 1-2 minutes).

#### E. Deploy Cloud Function

```bash
firebase deploy --only functions
```

After deployment, the function will automatically run every 5 minutes!

### 4. Firebase Console Setup

1. Go to Firebase Console → Cloud Messaging
2. Ensure Cloud Messaging API is enabled
3. Go to Functions → verify scheduled function is running

### 5. Android Configuration

The AndroidManifest.xml already has the necessary Firebase Messaging service configuration.

### 6. iOS Configuration (if needed)

1. Enable Push Notifications in Xcode
2. Add Push Notifications capability
3. Upload APNs key to Firebase Console → Project Settings → Cloud Messaging

## How It Works

1. User logs in → FCM token is registered and stored in `users/{uid}/fcmToken`
2. User creates reminder → Stored in `users/{uid}/reminders/{reminderId}` with `status: 'scheduled'`
3. Cloud Function runs every 5 minutes:
   - Queries all scheduled reminders where `notifyAtUTC` has passed
   - Sends FCM notification to user's `fcmToken`
   - Marks reminder as `fcmSent: true`
4. App receives FCM notification → Shows alert/notification automatically

## Testing

1. Create a reminder with notifyAtUTC set to 1-2 minutes from now
2. Wait for Cloud Function to trigger (every 5 minutes max delay)
3. You should receive FCM notification on device

## Troubleshooting

- **No notifications**: Check FCM token is registered in Firestore
- **Cloud Function errors**: Check Firebase Console → Functions logs
- **Invalid token**: Function automatically removes invalid tokens

