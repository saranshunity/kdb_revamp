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
    if (!user?.id) return;
    const now = new Date();
    const eventStart = new Date(now.getTime() + 11 * 60 * 1000); // in 11 minutes
    Alert.alert('Adding test reminder', JSON.stringify({
      now: now.toISOString(),
      eventStart: eventStart.toISOString(),
      leadMinutes: 10,
    }));
    await ReminderService.createReminder({
      userId: user.id,
      eventId: 'test-event',
      title: 'Test Reminder',
      location: 'Kurukshetra',
      eventStartAtUTC: eventStart.toISOString(),
      leadMinutes: 10,
    }).catch(() => {});
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
        <BodyText color={COLORS.text.secondary} size='xxs'>
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


