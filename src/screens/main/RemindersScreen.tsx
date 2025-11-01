import React, { useEffect, useState } from 'react';
import { View, StatusBar, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { H2, BodyText } from '../../components/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ReminderService, { UserReminder } from '../../services/ReminderService';
import FCMService from '../../services/FCMService';
import { useAuth } from '../../contexts/AuthContext';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

const RemindersScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [reminders, setReminders] = useState<UserReminder[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = ReminderService.subscribeToReminders(user.id, (list) => setReminders(list));
    return () => unsub();
  }, [user?.id]);

  const addTestReminder = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in first');
      return;
    }
    
    try {
      const now = new Date();
      // Create reminder that's already due (1 minute ago) for immediate testing
      // This way, when Cloud Function runs, it will immediately send notification
      const eventStart = new Date(now.getTime() + 5 * 60 * 1000); // event in 5 minutes
      const leadMinutes = 6; // notify 6 minutes before = 1 minute ago (already due!)
      
      const reminderId = await ReminderService.createReminder({
        userId: user.id,
        eventId: `test-event-${Date.now()}`,
        title: 'Test Reminder',
        location: 'Kurukshetra',
        eventStartAtUTC: eventStart.toISOString(),
        leadMinutes,
      });
      
      const notifyAt = new Date(eventStart.getTime() - leadMinutes * 60 * 1000);
      Alert.alert(
        '✅ Test Reminder Added',
        `Notification time: ${notifyAt.toLocaleString()}\n` +
        `(Already due - will trigger immediately)\n\n` +
        `📱 Options:\n` +
        `1. Wait ~5 min for scheduled run\n` +
        `2. Trigger manually: Firebase Console → Functions → sendReminderNotifications → Run now`
      );
    } catch (error: any) {
      Alert.alert('Error', `Failed to create reminder: ${error?.message || 'Unknown error'}`);
    }
  };

  const checkReminderStatus = async () => {
    if (!user?.id) return;
    try {
      const nowISO = new Date().toISOString();
      const remindersSnapshot = await firestore()
        .collectionGroup('reminders')
        .where('status', '==', 'scheduled')
        .where('notifyAtUTC', '<=', nowISO)
        .where('fcmSent', '==', false)
        .limit(5)
        .get();

      const userReminders = remindersSnapshot.docs
        .filter(doc => doc.ref.path.includes(`users/${user.id}/reminders`))
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

      if (userReminders.length === 0) {
        Alert.alert(
          'Reminder Status',
          'No due reminders found.\n\n' +
          'Possible reasons:\n' +
          '1. Reminder already sent (fcmSent=true)\n' +
          '2. Reminder not yet due\n' +
          '3. Check Firebase Console → Functions → Logs for errors'
        );
      } else {
        const statusMsg = userReminders.map((r: any) => 
          `• ${r.title}\n  Due: ${new Date(r.notifyAtUTC).toLocaleString()}\n  Status: ${r.fcmSent ? 'Sent' : 'Pending'}`
        ).join('\n\n');
        
        Alert.alert(
          'Due Reminders Found',
          `${userReminders.length} reminder(s) due:\n\n${statusMsg}\n\n` +
          'Cloud Function should process these in the next run (~5 min)'
        );
      }
    } catch (e: any) {
      const errorMsg = e?.message || 'Unknown error';
      let alertMsg = `Error: ${errorMsg}`;
      
      // Check if it's an index error
      if (errorMsg.includes('index')) {
        alertMsg += '\n\n⚠️ Index Issue:\n';
        alertMsg += 'Required index:\n';
        alertMsg += 'Collection: reminders (collection group)\n';
        alertMsg += 'Fields:\n';
        alertMsg += '1. status (Ascending)\n';
        alertMsg += '2. fcmSent (Ascending)\n';
        alertMsg += '3. notifyAtUTC (Ascending)\n\n';
        alertMsg += 'Check Firebase Console → Firestore → Indexes\n';
        alertMsg += 'Make sure the index shows "Enabled" (not "Building")';
      }
      
      Alert.alert('Error', alertMsg);
      console.error('Reminder status check error:', e);
    }
  };

  const showFCMToken = async () => {
    if (!user?.id) return;
    try {
      // Check permission status
      const authStatus = await messaging().hasPermission();
      const hasPermission = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      // Get current token from device
      const currentToken = await messaging().getToken();
      
      // Get FCM token from Firestore (already registered on login)
      const userDoc = await firestore().collection('users').doc(user.id).get();
      const fcmToken = userDoc.data()?.fcmToken;
      
      const statusMsg = `Permission: ${hasPermission ? '✅ Granted' : '❌ Denied'}\n` +
                        `Current Token: ${currentToken ? currentToken.substring(0, 30) + '...' : 'null'}\n` +
                        `Stored Token: ${fcmToken ? fcmToken.substring(0, 30) + '...' : 'null'}`;
      
      if (!hasPermission) {
        Alert.alert('FCM Status', statusMsg + '\n\n⚠️ Permission denied. Please enable notifications in settings.');
        return;
      }
      
      if (!fcmToken || !currentToken) {
        // Register token if not exists
        const token = await FCMService.registerToken(user.id);
        if (token) {
          Alert.alert('FCM Token Registered', `Token: ${token.substring(0, 50)}...\n\nFull token saved in Firestore.`);
        } else {
          Alert.alert('Error', 'Failed to get FCM token. Check permissions.');
        }
      } else {
        Alert.alert(
          'FCM Token',
          `${statusMsg}\n\nFull Token:\n${currentToken}\n\nCopy this to test in Firebase Console → Cloud Messaging`,
          [{ text: 'OK' }]
        );
      }
    } catch (e: any) {
      Alert.alert('Error', `Failed: ${e?.message || 'Unknown error'}`);
      console.error('FCM token error:', e);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name='arrow-back-outline' size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        <H2 color={COLORS.text.primary} weight='bold'>Reminders</H2>
        <TouchableOpacity style={styles.testButton} onPress={addTestReminder}>
          <BodyText color={COLORS.background.appColor} size='xs' weight='semiBold'>Add Test</BodyText>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
        <TouchableOpacity onPress={showFCMToken} style={{ marginBottom: 8 }}>
          <BodyText color={COLORS.primary} size='xs' weight='semiBold'>Show FCM Token & Status</BodyText>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={checkReminderStatus} 
          style={{ marginBottom: 8, marginTop: 8 }}
        >
          <BodyText color={COLORS.primary} size='xs' weight='semiBold'>
            🔍 Check Reminder Status
          </BodyText>
        </TouchableOpacity>
        <BodyText color={COLORS.text.secondary} size='xs'>
          💡 Test: Send from Firebase Console → Cloud Messaging → Send test message
        </BodyText>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.listContainer}>
          {reminders.map((r) => (
            <View key={r.id} style={styles.item}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <BodyText color={COLORS.text.primary} size='sm' weight='medium'>
                  {r.title}
                </BodyText>
                <BodyText color={COLORS.text.secondary} size='xs'>
                  {new Date(r.notifyAtUTC).toLocaleString()} {r.status !== 'scheduled' ? `• ${r.status}` : ''}
                </BodyText>
              </View>
              {r.status === 'scheduled' && (
                <TouchableOpacity
                  onPress={() => user?.id && ReminderService.cancelReminder(user.id, r.id).catch(() => {})}
                  style={styles.cancelBtn}
                >
                  <Ionicons name='close' size={14} color={COLORS.error} />
                  <BodyText color={COLORS.error} size='xs' weight='semiBold'>Cancel</BodyText>
                </TouchableOpacity>
              )}
            </View>
          ))}
          {reminders.length === 0 && (
            <BodyText color={COLORS.text.secondary} size='sm'>No reminders yet.</BodyText>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { 
    paddingHorizontal: 20, 
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: { padding: 6 },
  testButton: { padding: 6 },
  listContainer: { paddingHorizontal: 20 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
});

export default RemindersScreen;


