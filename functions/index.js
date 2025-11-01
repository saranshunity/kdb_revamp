/**
 * Cloud Functions for KDB Revamp
 *
 * Reminder Scheduler: Sends FCM notifications for due reminders
 */

const {onSchedule} = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Scheduled function that runs every 5 minutes to send FCM notifications
 * for reminders whose notifyAtUTC time has passed.
 */
exports.sendReminderNotifications = onSchedule(
    {
      schedule: "every 5 minutes",
      timeZone: "UTC",
    },
    async (event) => {
      const now = new Date();
      const nowISO = now.toISOString();

      console.log(
          `[${nowISO}] Checking reminders where notifyAtUTC <= ${nowISO}`,
      );

      // Use collectionGroup to query all reminders across all users efficiently
      const remindersSnapshot = await admin
          .firestore()
          .collectionGroup("reminders")
          .where("status", "==", "scheduled")
          .where("notifyAtUTC", "<=", nowISO)
          .where("fcmSent", "==", false)
          .limit(100) // Process max 100 per run to avoid timeout
          .get();

      if (remindersSnapshot.empty) {
        console.log("No due reminders found.");
        return null;
      }

      console.log(`Found ${remindersSnapshot.size} reminders to process`);

      let sentCount = 0;
      let errorCount = 0;

      // Group reminders by userId to fetch FCM tokens efficiently
      const remindersByUser = new Map();

      for (const reminderDoc of remindersSnapshot.docs) {
        // Extract userId from path: users/{userId}/reminders/{reminderId}
        const pathParts = reminderDoc.ref.path.split("/");
        const userId = pathParts[1]; // users/{userId}/...

        if (!remindersByUser.has(userId)) {
          remindersByUser.set(userId, []);
        }
        remindersByUser.get(userId).push(reminderDoc);
      }

      // Fetch FCM tokens for all users at once
      const userIds = Array.from(remindersByUser.keys());
      const userDocs = await Promise.all(
          userIds.map((userId) =>
            admin.firestore().collection("users").doc(userId).get(),
          ),
      );

      const userTokens = new Map();
      userDocs.forEach((doc, index) => {
        const userId = userIds[index];
        const fcmToken = doc.data()?.fcmToken;
        if (fcmToken) {
          userTokens.set(userId, fcmToken);
        }
      });

      // Send notifications
      const messages = [];
      const updates = [];

      for (const [userId, reminderDocs] of remindersByUser.entries()) {
        const fcmToken = userTokens.get(userId);

        if (!fcmToken) {
          console.warn(
              `No FCM token for user ${userId}, ` +
              `skipping ${reminderDocs.length} reminders`,
          );
          continue;
        }

        for (const reminderDoc of reminderDocs) {
          const reminder = reminderDoc.data();

          const message = {
            notification: {
              title: reminder.title,
              body: reminder.location ?
              `${reminder.location} • Event starts soon` :
              "Your event starts soon!",
            },
            token: fcmToken,
            data: {
              type: "reminder",
              reminderId: reminderDoc.id,
              eventId: reminder.eventId || "",
            },
            android: {
              priority: "high",
              notification: {
                channelId: "reminders",
                sound: "default",
                clickAction: "FLUTTER_NOTIFICATION_CLICK",
              },
            },
            apns: {
              payload: {
                aps: {
                  sound: "default",
                  badge: 1,
                },
              },
            },
          };

          messages.push({message, reminderRef: reminderDoc.ref});
        }
      }

      // Send all messages
      for (const {message, reminderRef} of messages) {
        try {
          await admin.messaging().send(message);
          updates.push(reminderRef.update({fcmSent: true}));
          sentCount++;
          console.log(`✅ Sent reminder ${reminderRef.id}`);
        } catch (error) {
          console.error(
              `❌ Error sending reminder ${reminderRef.id}:`,
              error.message,
          );
          errorCount++;

          // If token is invalid, mark it for removal
          if (error.code === "messaging/invalid-registration-token" ||
            error.code === "messaging/registration-token-not-registered") {
            const userId = reminderRef.path.split("/")[1];
            await admin.firestore().collection("users").doc(userId).update({
              fcmToken: admin.firestore.FieldValue.delete(),
            });
            console.log(`Removed invalid FCM token for user ${userId}`);
          }
        }
      }

      // Commit all Firestore updates
      if (updates.length > 0) {
        await Promise.all(updates);
      }

      console.log(`✅ Completed: ${sentCount} sent, ${errorCount} errors`);
    },
);
