import React, { useEffect, useState } from 'react';
import { View, StatusBar, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { H2, BodyText } from '../../components/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ReminderService, { UserReminder } from '../../services/ReminderService';
import { useAuth } from '../../contexts/AuthContext';

const RemindersScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [reminders, setReminders] = useState<UserReminder[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = ReminderService.subscribeToReminders(user.id, (list) => setReminders(list));
    return () => unsub();
  }, [user?.id]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name='arrow-back-outline' size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        <H2 color={COLORS.text.primary} weight='bold'>Reminders</H2>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.listContainer}>
          {reminders.map((r) => (
            <TouchableOpacity
              key={r.id}
              onPress={() => navigation.navigate('EventDetail', { eventId: r.eventId })}
              activeOpacity={0.7}
              style={styles.item}
            >
              <View style={{ flex: 1, paddingRight: 10 }}>
                <BodyText color={COLORS.text.primary} size='sm' weight='medium'>
                  {r.title}
                </BodyText>
                <BodyText color={COLORS.text.secondary} size='xs'>
                  {new Date(r.notifyAtUTC).toLocaleString()} {r.status !== 'scheduled' ? `• ${r.status}` : ''}
                </BodyText>
              </View>
              {r.status === 'scheduled' && !r.fcmSent && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    if (user?.id) {
                      ReminderService.cancelReminder(user.id, r.id).catch(() => {});
                    }
                  }}
                  style={styles.cancelBtn}
                >
                  <Ionicons name='close' size={14} color={COLORS.error} />
                  <BodyText color={COLORS.error} size='xs' weight='semiBold'>Cancel</BodyText>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
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
  headerRight: { width: 60 }, // Placeholder to balance the header
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


