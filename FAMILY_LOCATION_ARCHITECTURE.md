# Family Location Tracking - Architecture Design

## 🎯 Core Requirements

1. **Real-time location sharing** between family members
2. **Battery-efficient** background tracking
3. **Privacy controls** - granular sharing permissions
4. **Offline support** - handle network disconnections
5. **Scalable** - support multiple family groups
6. **Secure** - only authorized family members can see locations

---

## 📊 Data Architecture (Firestore)

### **1. Family Groups Collection**
```
families/{familyId}
├── name: string                    // "Sharma Family"
├── createdBy: string              // userId of creator
├── createdAt: Timestamp
├── members: array                  // Array of member objects
│   ├── userId: string
│   ├── role: "admin" | "member"   // Admin can add/remove members
│   ├── addedAt: Timestamp
│   └── addedBy: string
└── settings: object
    ├── allowLocationSharing: boolean
    └── defaultSharingDuration: number  // hours
```

### **2. Family Members Subcollection**
```
families/{familyId}/members/{userId}
├── userId: string                  // Reference to users/{userId}
├── role: "admin" | "member"
├── addedAt: Timestamp
├── addedBy: string
└── nickname: string                // Custom name in this family group
```

### **2b. Pending Invitations Subcollection** (for users not yet registered)
```
families/{familyId}/invitations/{invitationId}
├── phoneNumber: string             // Normalized phone number (+919876543210)
├── invitedByName: string           // Name of person who invited
├── relation: string                // Relation to inviter
├── invitedAt: Timestamp
├── invitedBy: string               // userId of admin who invited
├── status: "pending" | "accepted" | "expired"
└── expiresAt: Timestamp            // Optional: invitation expiry (e.g., 30 days)
```
**Note:** When user registers with this phone number, Cloud Function auto-adds them to family

### **3. User Location Tracking**
```
users/{userId}/location
├── latitude: number
├── longitude: number
├── accuracy: number                // meters
├── altitude: number | null
├── heading: number | null          // direction of travel
├── speed: number | null            // m/s
├── timestamp: Timestamp            // When location was recorded
├── updatedAt: Timestamp            // Last update time
├── isActive: boolean               // Is user actively sharing location?
└── batteryLevel: number | null    // For battery optimization
```

### **3b. Aggregated Live Locations Feed** (Optimized for Map Performance)
```
families/{familyId}/liveLocations/{userId}
├── latitude: number
├── longitude: number
├── accuracy: number
├── timestamp: Timestamp
├── updatedAt: Timestamp
└── userId: string                  // Reference to users/{userId}
```
**Why:** Instead of listening to multiple `users/{userId}/location` documents, listen to one subcollection `families/{familyId}/liveLocations` for all family members. This reduces listener overhead and improves map performance.
**Sync:** Cloud Function syncs from `users/{userId}/location` → `families/{familyId}/liveLocations/{userId}` when user is sharing with this family.

### **4. Location Sharing Preferences** (Per User)
```
users/{userId}/sharingPreferences
├── shareWithFamilies: array        // Array of familyIds user shares with
├── defaultVisibility: "all" | "selected" | "none"
├── sharingSchedule: object         // Optional: Only share during certain hours
│   ├── enabled: boolean
│   ├── startTime: string          // "09:00"
│   └── endTime: string            // "22:00"
└── locationUpdateInterval: number  // seconds (30, 60, 120, 300)
```

### **5. Location History** (Optional - for "breadcrumb trail")
```
users/{userId}/locationHistory/{timestamp}
├── latitude: number
├── longitude: number
├── timestamp: Timestamp
└── accuracy: number
```
**Note:** Auto-delete entries older than 24 hours (Cloud Function - see Cloud Functions section)

---

## 🔄 Real-time Location Tracking Strategy

### **Location Update Intervals (Smart Adaptive)**

```
Battery Level > 50%:
  - Moving (> 1 m/s): Update every 30 seconds
  - Stationary (< 1 m/s): Update every 2 minutes

Battery Level 20-50%:
  - Moving: Update every 60 seconds
  - Stationary: Update every 5 minutes

Battery Level < 20%:
  - Moving: Update every 2 minutes
  - Stationary: Update every 10 minutes
```

### **Background Location Service**

**React Native Library:** `@react-native-community/geolocation` + `react-native-background-geolocation` (or `@mauron85/react-native-background-geolocation`)

**Implementation:**
1. **Foreground:** Update every 30-60 seconds
2. **Background:** Use native background location service
3. **Geofencing:** Optional - notify when family member enters/leaves area

---

## 🔐 Security & Privacy

### **Firestore Security Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: Check if user is family member
    function isFamilyMember(familyId, userId) {
      return exists(/databases/$(database)/documents/families/$(familyId)/members/$(userId));
    }
    
    // Users can read their own location
    match /users/{userId}/location {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Family members can read locations of other members
    match /users/{userId}/location {
      allow read: if request.auth != null && 
                     exists(/databases/$(database)/documents/families/{familyId}) &&
                     isFamilyMember(familyId, request.auth.uid) &&
                     isFamilyMember(familyId, userId);
    }
    
    // Family groups
    match /families/{familyId} {
      allow read: if request.auth != null && 
                     isFamilyMember(familyId, request.auth.uid);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       isFamilyMember(familyId, request.auth.uid);
      
      match /members/{memberId} {
        allow read: if request.auth != null && 
                       isFamilyMember(familyId, request.auth.uid);
        allow write: if request.auth != null && 
                        (request.resource.data.role == 'admin' || 
                         memberId == request.auth.uid);
      }
      
      // Live locations feed (read-only for family members, written by Cloud Function)
      match /liveLocations/{userId} {
        allow read: if request.auth != null && 
                       isFamilyMember(familyId, request.auth.uid);
        // Write only by Cloud Function (service account)
      }
      
      // Invitations
      match /invitations/{invitationId} {
        allow read: if request.auth != null && 
                       isFamilyMember(familyId, request.auth.uid);
        allow write: if request.auth != null && 
                        isFamilyMember(familyId, request.auth.uid);
      }
    }
  }
}
```

### **Privacy Controls**

1. **User-level:** User can pause sharing entirely
2. **Family-level:** User can choose which families to share with
3. **Time-based:** Share only during certain hours
4. **Distance-based:** Only share approximate location (city-level) vs precise

---

## 📱 Implementation Layers

### **1. Location Service Layer** (`LocationService.ts`)

```typescript
import DeviceInfo from 'react-native-device-info';

class LocationService {
  private batteryListener: any;
  private currentSpeed: number = 0;
  
  // Start tracking location (with battery-aware adaptive intervals)
  startTracking(userId: string, options?: TrackingOptions): Promise<void>
  
  // Stop tracking
  stopTracking(): Promise<void>
  
  // Update location in Firestore
  updateLocation(userId: string, location: LocationData): Promise<void>
  
  // Get current location
  getCurrentLocation(): Promise<LocationData>
  
  // Check if tracking is active
  isTracking(): boolean
  
  // Set update interval based on battery/movement (uses native battery listeners)
  adaptUpdateInterval(batteryLevel: number, speed: number): void
  
  // Calculate optimal interval based on battery and movement
  private calculateInterval(batteryLevel: number, speed: number): number
}
```

### **2. Family Service Layer** (`FamilyService.ts`)

```typescript
class FamilyService {
  // Create family group
  createFamily(name: string, userId: string): Promise<string>
  
  // Add member to family (via phone number)
  // Flow: Lookup user by phone → If exists, add directly → If not, create pending invitation
  addMember(familyId: string, phoneNumber: string, relation: string, addedBy: string): Promise<{
    success: boolean;
    userId?: string;  // If user exists
    invitationId?: string;  // If user doesn't exist yet
    status: 'added' | 'invited' | 'already_member' | 'error';
  }>
  
  // Remove member
  removeMember(familyId: string, memberId: string): Promise<void>
  
  // Get all families user belongs to
  getUserFamilies(userId: string): Promise<Family[]>
  
  // Get all members in a family
  getFamilyMembers(familyId: string): Promise<FamilyMember[]>
  
  // Subscribe to family member locations (real-time)
  subscribeToMemberLocations(
    familyId: string, 
    callback: (locations: Map<string, LocationData>) => void
  ): () => void
  
  // Accept invitation (when user registers/logs in)
  acceptInvitation(invitationId: string, userId: string): Promise<void>
}
```

#### **Member Addition Flow (Phone Number Based)**

**Step 1: Admin enters phone number**
- Admin provides: phone number, name, relation
- Phone number is normalized (e.g., `+919876543210`)

**Step 2: Lookup user in Firestore**
```typescript
// Query users collection by phone number
const userQuery = await firestore()
  .collection('users')
  .where('phone', '==', normalizedPhone)
  .limit(1)
  .get();
```

**Step 3: Handle different scenarios**

**Scenario A: User exists**
- User already registered in the app
- Add them directly to `families/{familyId}/members/{userId}`
- Create entry with role, relation, addedAt, addedBy
- Update `families/{familyId}.members` array
- **Result:** Member immediately appears in family group

**Scenario B: User doesn't exist**
- User hasn't registered yet
- Create pending invitation in `families/{familyId}/invitations/{invitationId}`
- Store: phoneNumber, invitedByName, relation, invitedAt, status: 'pending'
- Send SMS/notification when they register (via Cloud Function)
- **Result:** Member added automatically when they sign up with that phone number

**Scenario C: Already a member**
- Check if user is already in `families/{familyId}/members/{userId}`
- Return error: "User is already a member of this family"

**Why Phone Number Instead of User ID?**
- ✅ Users don't know their user IDs
- ✅ Phone numbers are human-readable and memorable
- ✅ Works for inviting people who haven't joined yet
- ✅ Phone numbers are unique identifiers (already used for auth)
- ✅ Can send SMS invitation if user doesn't exist

### **3. Sharing Preferences Service** (`SharingPreferencesService.ts`)

```typescript
class SharingPreferencesService {
  // Update sharing preferences
  updatePreferences(userId: string, preferences: SharingPreferences): Promise<void>
  
  // Get preferences
  getPreferences(userId: string): Promise<SharingPreferences>
  
  // Check if user is sharing with family
  isSharingWithFamily(userId: string, familyId: string): Promise<boolean>
  
  // Pause/resume sharing
  setSharingEnabled(userId: string, enabled: boolean): Promise<void>
}
```

---

## 🗺️ Map Display Strategy

### **Real-time Updates (Optimized)**

⚠️ **Problem:** Firestore sends a new snapshot every time any location changes → could cause marker lag with multiple listeners.

✅ **Solution: Use Aggregated Live Feed**
1. **Single Listener:** Subscribe to `families/{familyId}/liveLocations` subcollection (one listener instead of N)
2. **Debounced Updates:** Batch map marker updates to avoid janky animations
3. **Smart Zoom:** Auto-fit all family members or selected member
4. **Marker Clustering:** When multiple members are close together

**Implementation:**
```typescript
// Instead of multiple listeners:
// ❌ BAD: users/user1/location, users/user2/location, users/user3/location...

// ✅ GOOD: Single listener
const unsubscribe = firestore()
  .collection('families')
  .doc(familyId)
  .collection('liveLocations')
  .onSnapshot((snapshot) => {
    // All family member locations in one snapshot
    const locations = new Map();
    snapshot.forEach(doc => {
      locations.set(doc.id, doc.data());
    });
    updateMapMarkers(locations);
  });
```

### **UI States**

- **Loading:** Show skeleton/placeholder
- **No Location:** Show "Location not available" with last seen time
- **Location Sharing Off:** Show grayed-out marker with "Sharing disabled"
- **Old Location:** Show warning if location is > 10 minutes old

---

## 🔋 Battery Optimization

### **Strategies**

1. **Adaptive Intervals:** Adjust based on battery level and movement
2. **Background Limits:** Reduce frequency when app is in background
3. **Stationary Detection:** Increase interval when user hasn't moved
4. **Battery Monitoring:** Use native battery listeners (not manual checks)
5. **Foreground Priority:** More frequent updates when viewing map

### **Battery-Aware Adaptive Timer**

⚠️ **Problem:** Manually checking battery level requires polling.

✅ **Solution: Use Native Battery Listeners**

**Library:** `react-native-device-info`

```typescript
import DeviceInfo from 'react-native-device-info';

class LocationService {
  private batteryListener: any;
  
  async startTracking() {
    // Subscribe to battery level changes
    this.batteryListener = DeviceInfo.getBatteryLevel().then(level => {
      this.adaptUpdateInterval(level, this.currentSpeed);
    });
    
    // iOS: Listen for battery state changes
    if (Platform.OS === 'ios') {
      DeviceInfo.getBatteryLevel().then(level => {
        // Update interval dynamically
        this.setUpdateInterval(this.calculateInterval(level, this.currentSpeed));
      });
    }
    
    // Android: Use BatteryManager or react-native-device-info events
    // Adjust interval dynamically as battery changes
  }
  
  private calculateInterval(batteryLevel: number, speed: number): number {
    if (batteryLevel > 0.5) {
      return speed > 1 ? 30000 : 120000; // 30s moving, 2min stationary
    } else if (batteryLevel > 0.2) {
      return speed > 1 ? 60000 : 300000; // 1min moving, 5min stationary
    } else {
      return speed > 1 ? 120000 : 600000; // 2min moving, 10min stationary
    }
  }
}
```

### **Android Specific**

- Use `FusedLocationProviderClient` (more battery efficient)
- Request `ACCESS_BACKGROUND_LOCATION` only when needed
- Use `foregroundService` for background tracking
- Monitor battery via `react-native-device-info` or BatteryManager

### **iOS Specific**

- Use `significantLocationChanges` when possible
- Request `always` permission only when user enables background sharing
- Use `locationManager.allowsBackgroundLocationUpdates = true` sparingly
- Use `react-native-device-info` for battery level monitoring

---

## 🌐 Offline Support

### **Strategy**

1. **Local Cache:** Store last known locations in AsyncStorage
2. **Queue Updates:** Queue location updates when offline, sync when online
3. **Timestamp:** Show "Last seen" time clearly
4. **Retry Logic:** Exponential backoff for failed updates

---

## 📊 Performance Considerations

### **Firestore**

1. **Batch Writes:** Batch location updates when possible
2. **Read Optimization:** Use Firestore listeners instead of polling
3. **Index Management:** Index on `timestamp` for location history queries
4. **Data Cleanup:** Cloud Function to delete old location history (> 24h) - see Cloud Functions section

### **React Native**

1. **Memoization:** Memoize map markers/components
2. **Debouncing:** Debounce rapid location updates
3. **Virtual Lists:** Use FlatList for family member lists
4. **Image Caching:** Cache family member profile photos

---

## ☁️ Cloud Functions

### **1. Location History Cleanup**

**Scheduled Function:** Delete location history older than 24 hours

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.cleanupLocationHistory = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const db = admin.firestore();
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const batch = db.batch();
    let batchCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const historyRef = db.collection(`users/${userDoc.id}/locationHistory`);
      const oldEntries = await historyRef
        .where('timestamp', '<', admin.firestore.Timestamp.fromMillis(cutoffTime))
        .get();
      
      oldEntries.forEach(doc => {
        batch.delete(doc.ref);
        batchCount++;
        
        // Firestore batch limit is 500
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      });
    }
    
    if (batchCount > 0) {
      await batch.commit();
    }
    
    console.log(`Cleaned up ${batchCount} old location history entries`);
    return null;
  });
```

### **2. Sync Live Locations Feed**

**Trigger:** When `users/{userId}/location` is updated

```javascript
exports.syncLiveLocations = functions.firestore
  .document('users/{userId}/location')
  .onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const locationData = change.after.data();
    
    // Get all families this user belongs to
    const familiesSnapshot = await admin.firestore()
      .collection('families')
      .where('members', 'array-contains', userId)
      .get();
    
    // Check if user is sharing with each family
    const sharingPrefs = await admin.firestore()
      .doc(`users/${userId}/sharingPreferences`)
      .get();
    
    const shareWithFamilies = sharingPrefs.data()?.shareWithFamilies || [];
    
    // Update liveLocations for each family
    const batch = admin.firestore().batch();
    familiesSnapshot.forEach(familyDoc => {
      const familyId = familyDoc.id;
      if (shareWithFamilies.includes(familyId) && locationData.isActive) {
        const liveLocationRef = admin.firestore()
          .doc(`families/${familyId}/liveLocations/${userId}`);
        batch.set(liveLocationRef, {
          userId,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          timestamp: locationData.timestamp,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });
    
    await batch.commit();
    return null;
  });
```

### **3. FCM Alerts for Disconnections**

**Scheduled Function:** Monitor users who haven't updated location and alert family

```javascript
exports.monitorDisconnections = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    const db = admin.firestore();
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    // Get all active users sharing location
    const usersSnapshot = await db.collection('users')
      .where('location.isActive', '==', true)
      .get();
    
    for (const userDoc of usersSnapshot.docs) {
      const locationData = userDoc.data().location;
      const lastUpdate = locationData.updatedAt?.toMillis() || 0;
      
      // If last update was more than 5 minutes ago
      if (lastUpdate < fiveMinutesAgo) {
        const userId = userDoc.id;
        
        // Get user's families
        const familiesSnapshot = await db.collection('families')
          .where('members', 'array-contains', userId)
          .get();
        
        // Send FCM notification to other family members
        for (const familyDoc of familiesSnapshot.docs) {
          const familyData = familyDoc.data();
          const members = familyData.members || [];
          
          // Get FCM tokens for other family members
          for (const memberId of members) {
            if (memberId !== userId) {
              const memberDoc = await db.doc(`users/${memberId}`).get();
              const fcmToken = memberDoc.data()?.fcmToken;
              
              if (fcmToken) {
                await admin.messaging().send({
                  token: fcmToken,
                  notification: {
                    title: 'Location Update Missing',
                    body: `${userDoc.data().firstName || 'Family member'} hasn't shared location recently`,
                  },
                  data: {
                    type: 'location_disconnected',
                    userId,
                    familyId: familyDoc.id,
                  },
                });
              }
            }
          }
        }
      }
    }
    
    return null;
  });
```

### **4. Auto-Accept Invitations on Registration**

**Trigger:** When new user is created

```javascript
exports.autoAcceptInvitations = functions.auth.user().onCreate(async (user) => {
  const db = admin.firestore();
  const phoneNumber = user.phoneNumber;
  
  if (!phoneNumber) return null;
  
  // Find pending invitations for this phone number
  const familiesSnapshot = await db.collectionGroup('invitations')
    .where('phoneNumber', '==', phoneNumber)
    .where('status', '==', 'pending')
    .get();
  
  for (const invitationDoc of familiesSnapshot.docs) {
    const invitationData = invitationDoc.data();
    const familyId = invitationDoc.ref.parent.parent.id;
    
    // Add user to family
    await db.doc(`families/${familyId}/members/${user.uid}`).set({
      userId: user.uid,
      role: 'member',
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
      addedBy: invitationData.invitedBy,
      nickname: invitationData.invitedByName,
    });
    
    // Update invitation status
    await invitationDoc.ref.update({
      status: 'accepted',
      acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  
  return null;
});
```

---

## 🚀 Implementation Phases

### **Phase 1: Core Functionality** ✅
- [x] UI Screens (FamilyMembersScreen, LocationMapScreen)
- [ ] Firebase data structure setup
- [ ] LocationService implementation
- [ ] Basic location tracking (foreground only)
- [ ] Real-time Firestore listeners

### **Phase 2: Family Management** 
- [ ] Create/join family groups
- [ ] Add/remove members (via phone number)
- [ ] Member invitations (via SMS/in-app)
- [ ] Role management (admin/member)

### **Phase 3: Advanced Tracking**
- [ ] Background location tracking
- [ ] Battery optimization
- [ ] Adaptive update intervals
- [ ] Movement detection

### **Phase 4: Privacy & Controls**
- [ ] Sharing preferences UI
- [ ] Time-based sharing
- [ ] Pause/resume sharing
- [ ] Approximate vs precise location

### **Phase 5: Enhanced Features**
- [ ] Location history/breadcrumbs
- [ ] Geofencing (notify when entering/leaving area)
- [ ] ETA calculation (when will they arrive?)
- [ ] Location sharing duration (temporary sharing)

---

## 🔧 Technical Stack

### **Libraries**

1. **Location:**
   - `@react-native-community/geolocation` - Basic location
   - `react-native-background-geolocation` - Background tracking (or `@mauron85/react-native-background-geolocation`)

2. **Firebase:**
   - `@react-native-firebase/firestore` - Database & real-time listeners
   - `@react-native-firebase/auth` - Authentication
   - `@react-native-firebase/functions` - Cloud Functions (for cleanup, sync, etc.)
   - `@react-native-firebase/messaging` - FCM notifications

3. **Maps:**
   - `react-native-maps` - Map display (already installed)

4. **Permissions:**
   - `react-native-permissions` - Permission handling (already installed)

5. **Storage:**
   - `@react-native-async-storage/async-storage` - Local caching

6. **Device Info:**
   - `react-native-device-info` - Battery level monitoring, device info

---

## 📝 Next Steps

1. **Review this architecture** - Make adjustments as needed
2. **Set up Firestore structure** - Create collections and security rules
3. **Implement LocationService** - Core tracking logic
4. **Implement FamilyService** - Family group management
5. **Wire up UI** - Connect screens to Firebase
6. **Test & Optimize** - Battery, performance, privacy

---

## ❓ Questions to Consider

1. **Invitation Flow:** ✅ **SOLVED** - Phone number lookup:
   - If user exists → Add directly
   - If user doesn't exist → Create pending invitation (auto-added on registration)
   - Optional: Send SMS invitation link for non-registered users
2. **Maximum Members:** Limit per family group?
3. **Location History:** How long to keep? (24h, 7 days, 30 days?)
4. **Admin Permissions:** What can admins do? (Remove members, change settings?)
5. **Multiple Families:** Can users belong to multiple families?
6. **Location Accuracy:** Show exact location or approximate (for privacy)?

---

## 🚀 Future Upgrade Path

### **Hybrid Architecture: Firestore + Realtime Database**

As your app scales, consider migrating to a hybrid approach:

**Current (Phase 1-3):**
- Firestore for everything (family groups, location updates, preferences)

**Future (Phase 4+):**
- **Firestore:** Family/group management, structured data, user profiles
- **Realtime Database:** High-frequency location updates (faster, cheaper for frequent writes)

**Why Hybrid?**
- ✅ **Realtime DB** is optimized for frequent updates (location tracking)
- ✅ **Firestore** is better for structured queries (family members, preferences)
- ✅ Lower costs for high-frequency location updates
- ✅ Better performance for real-time location streams

**Migration Strategy:**
1. Keep Firestore for family groups, members, preferences
2. Use Realtime DB path: `families/{familyId}/liveLocations/{userId}`
3. Cloud Function syncs from Realtime DB → Firestore for querying
4. Map listens to Realtime DB for ultra-fast updates

**Example Structure:**
```
Realtime Database:
families/{familyId}/liveLocations/{userId}
  ├── latitude: number
  ├── longitude: number
  ├── timestamp: number
  └── accuracy: number

Firestore:
families/{familyId}/members/{userId}  (unchanged)
users/{userId}/sharingPreferences      (unchanged)
```

---

This architecture provides a solid foundation for a robust, scalable family location tracking system. Let me know what you'd like to adjust or prioritize!

