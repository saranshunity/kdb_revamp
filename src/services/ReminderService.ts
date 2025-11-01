import firestore from '@react-native-firebase/firestore';

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
  createdAtMs?: number;
  fcmSent?: boolean; // whether FCM notification was sent
}

type CreateReminderParams = {
  userId: string;
  eventId: string;
  title: string;
  eventStartAtUTC: string; // ISO in UTC
  leadMinutes: number; // minutes before event start
  location?: string;
};

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

    console.log('ReminderService.createReminder', {
      eventStartAtUTC,
      eventStartLocal: new Date(eventStartAtUTC).toLocaleString(),
      leadMinutes,
      notifyAtUTC,
      notifyAtLocal: new Date(notifyAtUTC).toLocaleString(),
    });

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

    // Store reminder in Firestore - Cloud Function will send FCM notification at notifyAtUTC
    const docRef = await this.remindersCol(userId).add({
      eventId,
      title,
      location: location || '',
      eventStartAtUTC,
      notifyAtUTC,
      status: 'scheduled',
      createdAt: firestore.FieldValue.serverTimestamp(),
      createdAtMs: Date.now(),
      fcmSent: false,
    });

    return docRef.id;
  }

  async cancelReminder(userId: string, reminderId: string): Promise<void> {
    const docRef = this.remindersCol(userId).doc(reminderId);
    const snap = await docRef.get();
    if (!snap.exists) return;
    // Just update status - Cloud Function won't send FCM for cancelled reminders
    await docRef.update({ status: 'cancelled' });
  }

  subscribeToReminders(
    userId: string,
    onChange: (reminders: UserReminder[]) => void,
  ): () => void {
    return this.remindersCol(userId)
      .orderBy('createdAtMs', 'desc')
      .onSnapshot((snapshot) => {
        const list: UserReminder[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        onChange(list);
      });
  }
}

export default new ReminderService();


