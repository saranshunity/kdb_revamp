# Reminders Flow - Complete Implementation

## Overview
Users can set reminders for events, and receive FCM notifications at the scheduled time.

## Complete Flow

### 1. User Sets Reminder
- **Location**: `EventDetailScreen.tsx` → `handleSetReminder()`
- **Action**: User taps "Reminder" button
- **What happens**:
  - Validates user is logged in
  - Calls `ReminderService.createReminder()` with:
    - `eventId`: Event identifier
    - `title`: Event title
    - `location`: Event location (optional)
    - `eventStartAtUTC`: Event start time (ISO string)
    - `leadMinutes`: Minutes before event to notify

### 2. Reminder Saved to Firestore
- **Location**: `ReminderService.ts` → `createReminder()`
- **Path**: `users/{userId}/reminders/{reminderId}`
- **Document structure**:
  ```typescript
  {
    eventId: string,
    title: string,
    location?: string,
    eventStartAtUTC: string,  // ISO UTC string
    notifyAtUTC: string,       // ISO UTC string (eventStart - leadMinutes)
    status: 'scheduled',
    fcmSent: false,
    createdAt: Timestamp,
    createdAtMs: number       // For sorting
  }
  ```
- **Duplicate prevention**: Checks if reminder already exists for same event with `status='scheduled'`

### 3. Cloud Function Sends Notification
- **Location**: `functions/reminder-scheduler.js`
- **Schedule**: Runs every 5 minutes (cron: `every 5 minutes`)
- **What it does**:
  1. Queries all reminders where:
     - `status == 'scheduled'`
     - `notifyAtUTC <= now` (overdue)
     - `fcmSent == false`
  2. Groups reminders by userId
  3. Fetches FCM tokens for all users
  4. Sends FCM notification with:
     - Title: `reminder.title`
     - Body: `{location} • Event starts soon` or `Your event starts soon!`
     - Android channel: `'reminders'`
     - Data payload: `{ type: 'reminder', reminderId, eventId }`
  5. Marks reminder as `fcmSent: true`

### 4. User Receives Notification
- **Foreground**: `App.tsx` → FCM handler shows alert + local notification
- **Background/Quit**: FCM automatically displays notification
- **On tap**: Can navigate to event detail (future enhancement)

## Setup Required

### 1. Firestore Index (REQUIRED)
The Cloud Function uses `collectionGroup` query with multiple filters. You need to create a composite index:

**Firebase Console → Firestore → Indexes → Create Index**

- Collection ID: `reminders` (collection group)
- Fields:
  1. `status` (Ascending)
  2. `notifyAtUTC` (Ascending)
  3. `fcmSent` (Ascending)
- Query scope: Collection group

**OR** run this command (if Firebase CLI is set up):
```bash
firebase deploy --only firestore:indexes
```

### 2. Deploy Cloud Function
```bash
cd functions
npm install firebase-functions firebase-admin
cd ..
firebase deploy --only functions
```

### 3. Verify Notification Channels
- Channels are auto-created in `NotificationService.init()`:
  - `default` - For FCM messages without channel
  - `reminders` - For reminder notifications
- Ensure `POST_NOTIFICATIONS` permission is granted (Android 13+)

## Testing

### Quick Test (1-2 minutes)
1. Set a reminder with `leadMinutes` such that `notifyAtUTC` is ~1-2 minutes in future
2. Wait for Cloud Function to run (runs every 5 minutes)
3. Should receive FCM notification

### Immediate Test (trigger function manually)
1. Create reminder with `notifyAtUTC` in the past
2. Go to Firebase Console → Functions → `sendReminderNotifications` → "Run now"
3. Should receive notification immediately

## Files Involved

### Client Side
- `src/services/ReminderService.ts` - Creates/reads reminders
- `src/services/FCMService.ts` - Manages FCM tokens
- `src/services/NotificationService.ts` - Creates notification channels
- `src/screens/events/EventDetailScreen.tsx` - UI to set reminder
- `src/screens/main/RemindersScreen.tsx` - List all reminders
- `src/screens/main/HomeScreen.tsx` - Shows 2 recent reminders
- `App.tsx` - FCM message handlers

### Server Side
- `functions/reminder-scheduler.js` - Cloud Function to send notifications

## Future Enhancements
- [ ] Handle notification tap → navigate to event detail
- [ ] Allow users to set custom lead times
- [ ] Show event details in notification
- [ ] Allow multiple reminders per event
- [ ] Edit/cancel reminders from list

