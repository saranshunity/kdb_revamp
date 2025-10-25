import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H1, H2, H3, BodyText } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FirebaseService, { StallApplication } from '../../services/FirebaseService';
import { testFirebaseConnection, testStallCategories } from '../../utils/firebaseTest';
import { Alert } from 'react-native';

type AdminPanelScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminPanel'>;

interface AdminStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byCategory: { [categoryId: string]: number };
}

const AdminPanelScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AdminPanelScreenNavigationProp>();
  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    byCategory: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const statsData = await FirebaseService.getApplicationStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStats();
    setIsRefreshing(false);
  };

  const handleTestFirebase = async () => {
    try {
      Alert.alert('Testing Firebase', 'Starting Firebase connection test...');
      const success = await testFirebaseConnection();
      if (success) {
        Alert.alert('Success!', 'Firebase connection test passed! Check console for details.');
      } else {
        Alert.alert('Error', 'Firebase connection test failed! Check console for details.');
      }
    } catch (error: any) {
      console.error('Firebase test error:', error);
      Alert.alert('Error', 'Firebase test failed: ' + (error.message || 'Unknown error'));
    }
  };

  const adminOptions = [
    {
      id: 'test-firebase',
      title: 'Test Firebase Connection',
      description: 'Test Firestore and Storage connection',
      icon: 'flask-outline',
      color: COLORS.primary,
      onPress: handleTestFirebase,
    },
    {
      id: 'view-stats',
      title: 'View Statistics',
      description: `Total: ${stats.total}, Pending: ${stats.pending}, Approved: ${stats.approved}`,
      icon: 'bar-chart-outline',
      color: COLORS.secondary,
      onPress: () => Alert.alert('Statistics', `Total Applications: ${stats.total}\nPending: ${stats.pending}\nApproved: ${stats.approved}\nRejected: ${stats.rejected}`),
    },
  ];

  const renderStatsCard = (title: string, value: number, color: string, icon: string) => (
    <View key={title} style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsContent}>
        <View style={styles.statsLeft}>
          <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
          <View style={styles.statsText}>
            <BodyText color={COLORS.text.primary} size='sm' weight='semiBold'>
              {title}
            </BodyText>
            <H2 color={COLORS.text.primary} weight='bold' size='lg'>
              {value}
            </H2>
          </View>
        </View>
      </View>
    </View>
  );

  const renderAdminOption = (option: any) => (
    <TouchableOpacity
      key={option.id}
      style={styles.adminOption}
      onPress={option.onPress}
      activeOpacity={0.8}
    >
      <View style={styles.adminOptionLeft}>
        <View style={[styles.adminOptionIcon, { backgroundColor: option.color + '20' }]}>
          <Ionicons name={option.icon} size={24} color={option.color} />
        </View>
        <View style={styles.adminOptionContent}>
          <H3 color={COLORS.text.primary} weight='semiBold' size='md'>
            {option.title}
          </H3>
          <BodyText color={COLORS.text.secondary} size='sm' style={styles.adminOptionDescription}>
            {option.description}
          </BodyText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.text.tertiary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <H1 style={styles.headerTitle} color={COLORS.text.primary} weight='bold' size='lg'>
            Admin Panel
          </H1>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isRefreshing}
        >
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <H2 color={COLORS.text.primary} weight='semiBold' size='md' style={styles.sectionTitle}>
            Application Statistics
          </H2>
          
          <View style={styles.statsGrid}>
            {renderStatsCard('Total Applications', stats.total, COLORS.primary, 'document-outline')}
            {renderStatsCard('Pending Review', stats.pending, COLORS.warning, 'time-outline')}
            {renderStatsCard('Approved', stats.approved, COLORS.success, 'checkmark-circle-outline')}
            {renderStatsCard('Rejected', stats.rejected, COLORS.error, 'close-circle-outline')}
          </View>
        </View>

        {/* Admin Options */}
        <View style={styles.optionsSection}>
          <H2 color={COLORS.text.primary} weight='semiBold' size='md' style={styles.sectionTitle}>
            Management Options
          </H2>
          
          {adminOptions.map(renderAdminOption)}
        </View>

        {/* Footer Info */}
        <View style={styles.footerInfo}>
          <BodyText color={COLORS.text.tertiary} size='xs' style={styles.footerText}>
            Admin panel for managing International Gita Mahotsav 2025 stall applications.
            All actions are logged and tracked.
          </BodyText>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    width: '48%',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsContent: {
    flex: 1,
  },
  statsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statsText: {
    flex: 1,
  },
  optionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  adminOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adminOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  adminOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  adminOptionContent: {
    flex: 1,
  },
  adminOptionDescription: {
    marginTop: 4,
    lineHeight: 18,
  },
  footerInfo: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default AdminPanelScreen;

