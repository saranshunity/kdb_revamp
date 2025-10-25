import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H1, H2, H3, BodyText, ButtonTextPrimary } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FirebaseService from '../../services/FirebaseService';

type StallApplicationStatusScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StallApplicationStatus'>;
type StallApplicationStatusScreenRouteProp = RouteProp<RootStackParamList, 'StallApplicationStatus'>;

type ApplicationStatus = 'pending' | 'approved' | 'rejected';

interface ApplicationData {
  applicationId: string;
  category: any;
  formData: any;
  status: ApplicationStatus;
  submittedDate: string;
  reviewedDate?: string;
  remarks?: string;
}

const StallApplicationStatusScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StallApplicationStatusScreenNavigationProp>();
  const route = useRoute<StallApplicationStatusScreenRouteProp>();
  const { applicationId, category, formData, status: initialStatus } = route.params;

  const [applicationData, setApplicationData] = useState<ApplicationData>({
    applicationId,
    category,
    formData,
    status: initialStatus,
    submittedDate: new Date().toISOString(),
  });

  const [isLoading, setIsLoading] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Animation values
  const pulseAnim = new Animated.Value(1);
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
    loadApplicationStatus();
    startAnimations();
    startTimer();
  }, []);

  const loadApplicationStatus = async () => {
    try {
      setIsLoading(true);
      
      // Get the actual application data from Firebase
      const allApplications = await FirebaseService.getAllApplications();
      const currentApplication = allApplications.find(app => app.id === applicationId);
      
      if (currentApplication) {
        setApplicationData(prev => ({
          ...prev,
          status: currentApplication.status as ApplicationStatus,
          reviewedDate: currentApplication.reviewedAt ? new Date(currentApplication.reviewedAt).toISOString() : undefined,
          remarks: currentApplication.status === 'rejected' ? 'Application rejected due to incomplete documentation.' : undefined,
        }));
      } else {
        // If application not found, keep the passed status
        console.log('Application not found in database, using passed status');
      }
      
    } catch (error) {
      console.error('Error loading application status:', error);
      // If there's an error, keep the current status
    } finally {
      setIsLoading(false);
    }
  };

  const startAnimations = () => {
    // Pulse animation for pending status
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Rotate animation for loading spinner
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    pulseAnimation.start();
    rotateAnimation.start();
  };

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  };

  const formatTimeElapsed = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getStatusIcon = () => {
    switch (applicationData.status) {
      case 'approved':
        return { name: 'checkmark-circle', color: COLORS.success };
      case 'rejected':
        return { name: 'close-circle', color: COLORS.error };
      default:
        return { name: 'time-outline', color: COLORS.warning };
    }
  };

  const getStatusMessage = () => {
    switch (applicationData.status) {
      case 'approved':
        return {
          title: 'Application Approved!',
          message: 'Congratulations! Your stall application has been approved. You will receive further instructions via email.',
          color: COLORS.success,
        };
      case 'rejected':
        return {
          title: 'Application Rejected',
          message: 'Your application has been reviewed and unfortunately rejected. Please check the remarks below.',
          color: COLORS.error,
        };
      default:
        return {
          title: 'Application Under Review',
          message: 'Your application is currently being reviewed by our administration team. You will be notified once the review is complete.',
          color: COLORS.warning,
        };
    }
  };

  const handleRefresh = () => {
    loadApplicationStatus();
  };

  const handleGoBack = () => {
    navigation.navigate('Main');
  };

  const renderStatusCard = () => {
    const statusIcon = getStatusIcon();
    const statusMessage = getStatusMessage();

    return (
      <View style={[styles.statusCard, { borderColor: statusMessage.color + '40' }]}>
        <View style={styles.statusHeader}>
          <Animated.View
            style={[
              styles.statusIconContainer,
              { backgroundColor: statusMessage.color + '20' },
              applicationData.status === 'pending' && { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <Ionicons name={statusIcon.name} size={32} color={statusMessage.color} />
          </Animated.View>
          
          <View style={styles.statusContent}>
            <H2 color={statusMessage.color} weight='semiBold' size='lg'>
              {statusMessage.title}
            </H2>
            <BodyText color={COLORS.text.secondary} size='sm' style={styles.statusMessage}>
              {statusMessage.message}
            </BodyText>
          </View>
        </View>

        {applicationData.status === 'pending' && (
          <View style={styles.loadingContainer}>
            <Animated.View
              style={[
                styles.loadingSpinner,
                {
                  transform: [
                    {
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name="refresh" size={20} color={COLORS.primary} />
            </Animated.View>
            <BodyText color={COLORS.text.tertiary} size='xs'>
              Checking for updates...
            </BodyText>
          </View>
        )}
      </View>
    );
  };

  const renderApplicationDetails = () => (
    <View style={styles.detailsCard}>
      <H3 color={COLORS.text.primary} weight='semiBold' size='md' style={styles.detailsTitle}>
        Application Details
      </H3>
      
      <View style={styles.detailRow}>
        <BodyText color={COLORS.text.secondary} size='sm' weight='medium'>
          Application ID:
        </BodyText>
        <BodyText color={COLORS.text.primary} size='sm' weight='semiBold'>
          {applicationData.applicationId}
        </BodyText>
      </View>

      <View style={styles.detailRow}>
        <BodyText color={COLORS.text.secondary} size='sm' weight='medium'>
          Category:
        </BodyText>
        <BodyText color={COLORS.text.primary} size='sm' weight='semiBold'>
          {applicationData.category.name}
        </BodyText>
      </View>

      <View style={styles.detailRow}>
        <BodyText color={COLORS.text.secondary} size='sm' weight='medium'>
          Business Name:
        </BodyText>
        <BodyText color={COLORS.text.primary} size='sm' weight='semiBold'>
          {applicationData.formData.businessName}
        </BodyText>
      </View>

      <View style={styles.detailRow}>
        <BodyText color={COLORS.text.secondary} size='sm' weight='medium'>
          Submitted On:
        </BodyText>
        <BodyText color={COLORS.text.primary} size='sm' weight='semiBold'>
          {new Date(applicationData.submittedDate).toLocaleDateString()}
        </BodyText>
      </View>

      <View style={styles.detailRow}>
        <BodyText color={COLORS.text.secondary} size='sm' weight='medium'>
          Time Elapsed:
        </BodyText>
        <BodyText color={COLORS.text.primary} size='sm' weight='semiBold'>
          {formatTimeElapsed(timeElapsed)}
        </BodyText>
      </View>
    </View>
  );

  const renderRemarks = () => {
    if (applicationData.status === 'rejected' && applicationData.remarks) {
      return (
        <View style={styles.remarksCard}>
          <H3 color={COLORS.error} weight='semiBold' size='md' style={styles.remarksTitle}>
            Remarks
          </H3>
          <BodyText color={COLORS.text.secondary} size='sm' style={styles.remarksText}>
            {applicationData.remarks}
          </BodyText>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <H1 style={styles.headerTitle} color={COLORS.text.primary} weight='bold' size='md'>
            Application Status
          </H1>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isLoading}
        >
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        {renderStatusCard()}

        {/* Application Details */}
        {renderApplicationDetails()}

        {/* Remarks */}
        {renderRemarks()}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {applicationData.status === 'pending' && (
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={isLoading}
            >
              <ButtonTextPrimary size='md'>
                {isLoading ? 'Checking...' : 'Check Status'}
              </ButtonTextPrimary>
            </TouchableOpacity>
          )}

          {applicationData.status === 'approved' && (
            <TouchableOpacity
              style={styles.payNowButton}
              onPress={() => navigation.navigate('Payment', {
                applicationId: applicationData.applicationId,
                category: applicationData.category,
                formData: applicationData.formData,
              })}
            >
              <ButtonTextPrimary size='md'>
                Pay Now
              </ButtonTextPrimary>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={handleGoBack}
          >
            <ButtonTextPrimary size='md'>
              Back to Home
            </ButtonTextPrimary>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <BodyText color={COLORS.text.tertiary} size='xs' style={styles.infoText}>
            {applicationData.status === 'pending' 
              ? 'You will receive a notification once your application is reviewed. Please keep checking for updates.'
              : 'Thank you for your application. For any queries, please contact the administration team.'
            }
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
    fontSize: FONT_SIZES.md,
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
  statusCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusContent: {
    flex: 1,
  },
  statusMessage: {
    marginTop: 4,
    lineHeight: 18,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  loadingSpinner: {
    marginRight: 8,
  },
  detailsCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  detailsTitle: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  remarksCard: {
    backgroundColor: COLORS.error + '10',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  remarksTitle: {
    marginBottom: 8,
  },
  remarksText: {
    lineHeight: 18,
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  backToHomeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  payNowButton: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  infoText: {
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default StallApplicationStatusScreen;
