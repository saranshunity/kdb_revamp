import firestore from '@react-native-firebase/firestore';
import NotificationService from './NotificationService';

export type ReminderStatus = 'scheduled' | 'cancelled';

export interface UserReminder {
  id: string;
  eventId: string;
  title: string;
  location?: string;
  eventStartAtUTC: string; // ISO
  notifyAtUTC: string; // ISO
  status: ReminderStatus;
  createdAt: any;
  notificationId?: string; // local notification id on device
  channelId?: string; // android channel id
}

type CreateReminderParams = {
  userId: string;
  eventId: string;
  title: string;
  eventStartAtUTC: string; // ISO in UTC
  leadMinutes: number; // minutes before event start
  location?: string;
};

// Note: local notification scheduling is intentionally abstracted; integrate your
// preferred library (e.g., Notifee) inside `scheduleLocalNotification`/`cancelLocalNotification`.

async function scheduleLocalNotification(params: { title: string; body: string; notifyAt: Date; androidChannelId?: string }): Promise<string> {
  return NotificationService.scheduleLocalNotification(params);
}

async function cancelLocalNotification(notificationId?: string): Promise<void> {
  return NotificationService.cancelLocalNotification(notificationId);
}

function toDateFromUTC(iso: string): Date {
  return new Date(iso);
}

function toISOStringUTC(date: Date): string {
  return new Date(date.getTime()).toISOString();
}

class ReminderService {
  private remindersCol(userId: string) {
    return firestore().collection('users').doc(userId).collection('reminders');
  }

  async createReminder(params: CreateReminderParams): Promise<string> {
    const { userId, eventId, title, location, eventStartAtUTC, leadMinutes } = params;

    const eventStart = toDateFromUTC(eventStartAtUTC);
    const notifyAt = new Date(eventStart.getTime() - leadMinutes * 60 * 1000);
    const notifyAtUTC = toISOStringUTC(notifyAt);

    // Prevent duplicates: if a scheduled reminder for this event already exists, return existing id
    const existingSnap = await this.remindersCol(userId)
      .where('eventId', '==', eventId)
      .where('status', '==', 'scheduled')
      .limit(1)
      .get();
    if (!existingSnap.empty) {
      const existing = existingSnap.docs[0];
      return existing.id;
    }

    const body = location ? `${location} • Starts soon` : 'Starts soon';
    const notificationId = await scheduleLocalNotification({
      title,
      body,
      notifyAt,
      androidChannelId: 'reminders',
    });

    const docRef = await this.remindersCol(userId).add({
      eventId,
      title,
      location: location || '',
      eventStartAtUTC,
      notifyAtUTC,
      status: 'scheduled',
      createdAt: firestore.FieldValue.serverTimestamp(),
      notificationId,
      channelId: 'reminders',
    });

    return docRef.id;
  }

  async cancelReminder(userId: string, reminderId: string): Promise<void> {
    const docRef = this.remindersCol(userId).doc(reminderId);
    const snap = await docRef.get();
    if (!snap.exists) return;
    const data = snap.data() as Partial<UserReminder>;
    await cancelLocalNotification(data.notificationId);
    await docRef.update({ status: 'cancelled' });
  }

  async hydrateFutureReminders(userId: string): Promise<void> {
    const nowIso = new Date().toISOString();
    const qs = await this.remindersCol(userId)
      .where('status', '==', 'scheduled')
      .where('notifyAtUTC', '>=', nowIso)
      .get();

    for (const doc of qs.docs) {
      const r = doc.data() as UserReminder;
      // If a local notification id is missing, schedule it now
      if (!r.notificationId) {
        const notifyAt = toDateFromUTC(r.notifyAtUTC);
        const notificationId = await scheduleLocalNotification({
          title: r.title,
          body: r.location ? `${r.location} • Starts soon` : 'Starts soon',
          notifyAt,
          androidChannelId: r.channelId || 'reminders',
        });
        await doc.ref.update({ notificationId });
      }
    }
  }

  subscribeToReminders(
    userId: string,
    onChange: (reminders: UserReminder[]) => void,
  ): () => void {
    return this.remindersCol(userId)
      .orderBy('notifyAtUTC', 'asc')
      .onSnapshot((snapshot) => {
        const list: UserReminder[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        onChange(list);
      });
  }
}

export default new ReminderService();


