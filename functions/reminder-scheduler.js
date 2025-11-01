/**
 * Cloud Functions script to send FCM reminders
 * 
 * SETUP INSTRUCTIONS:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Initialize Functions: firebase init functions
 * 3. Install dependencies: cd functions && npm install
 * 4. Deploy: firebase deploy --only functions
 * 
 * This function runs on a schedule (every 5 minutes) and sends FCM notifications
 * for reminders whose notifyAtUTC time has passed.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendReminderNotifications = functions.pubsub
  .schedule('every 5 minutes')
  .timeZone('UTC')
  .onRun(async (context) => {
    const now = new Date().toISOString();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    console.log(`Checking reminders between ${fiveMinutesAgo} and ${now}`);

    // Query all users' reminders that need to be sent
    const usersSnapshot = await admin.firestore().collection('users').get();
    
    let sentCount = 0;
    let errorCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      const fcmToken = userData.fcmToken;

      if (!fcmToken) {
        continue; // Skip users without FCM token
      }

      // Get scheduled reminders for this user that need to be sent
      const remindersSnapshot = await admin
        .firestore()
        .collection('users')
        .doc(userId)
        .collection('reminders')
        .where('status', '==', 'scheduled')
        .where('notifyAtUTC', '>=', fiveMinutesAgo)
        .where('notifyAtUTC', '<=', now)
        .where('fcmSent', '==', false)
        .get();

      for (const reminderDoc of remindersSnapshot.docs) {
        const reminder = reminderDoc.data();
        
        try {
          const message = {
            notification: {
              title: reminder.title,
              body: reminder.location 
                ? `${reminder.location} • Event starts soon`
                : 'Event starts soon',
            },
            token: fcmToken,
            data: {
              type: 'reminder',
              reminderId: reminderDoc.id,
              eventId: reminder.eventId,
            },
            android: {
              priority: 'high',
              notification: {
                channelId: 'reminders',
                sound: 'default',
              },
            },
            apns: {
              payload: {
                aps: {
                  sound: 'default',
                },
              },
            },
          };

          await admin.messaging().send(message);
          
          // Mark as sent
          await reminderDoc.ref.update({ fcmSent: true });
          sentCount++;

          console.log(`Sent reminder ${reminderDoc.id} to user ${userId}`);
        } catch (error) {
          console.error(`Error sending reminder ${reminderDoc.id}:`, error);
          errorCount++;

          // If token is invalid, remove it
          if (error.code === 'messaging/invalid-registration-token' || 
              error.code === 'messaging/registration-token-not-registered') {
            await admin.firestore().collection('users').doc(userId).update({
              fcmToken: admin.firestore.FieldValue.delete(),
            });
          }
        }
      }
    }

    console.log(`Sent ${sentCount} reminders, ${errorCount} errors`);
    return null;
  });

