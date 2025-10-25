import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Share,
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
import firestore from '@react-native-firebase/firestore';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

type TirthMitraStatusScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TirthMitraStatus'>;
type TirthMitraStatusScreenRouteProp = RouteProp<RootStackParamList, 'TirthMitraStatus'>;

type ApplicationStatus = 'pending' | 'approved' | 'rejected';

interface TirthMitraApplication {
  applicationId: string;
  fullName: string;
  fatherName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  mobileNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  photoUri: string;
  idCardUri: string;
  selectedDistrict: string;
  selectedTirth: string;
  selectedTirthName: string;
  status: ApplicationStatus;
  submittedAt: any;
  reviewedAt?: any;
  reviewedBy?: string;
  rejectionReason?: string;
}

const TirthMitraStatusScreen = () => {
  const navigation = useNavigation<TirthMitraStatusScreenNavigationProp>();
  const route = useRoute<TirthMitraStatusScreenRouteProp>();
  const insets = useSafeAreaInsets();

  const [searchType, setSearchType] = useState<'phone' | 'applicationId'>('phone');
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [foundApplication, setFoundApplication] = useState<TirthMitraApplication | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Animation values
  const pulseAnim = new Animated.Value(1);
  const rotateAnim = new Animated.Value(0);

  // Set application data from route params if available
  useEffect(() => {
    if (route.params?.applicationData) {
      setFoundApplication(route.params.applicationData as TirthMitraApplication);
      startAnimations();
      startTimer();
    }
  }, [route.params]);

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

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      Alert.alert('Required Field', 'Please enter a phone number or application ID.');
      return;
    }

    try {
      setIsLoading(true);
      setFoundApplication(null);

      // Get all applications and filter by search criteria
      const allApplications = await firestore()
        .collection('tirthMitraApplications')
        .get();
      
      let application: TirthMitraApplication | undefined;
      
      if (searchType === 'phone') {
        // Search by phone number (try with and without country code)
        const phoneToSearch = searchValue.replace(/^\+91/, '');
        application = allApplications.docs.find(doc => {
          const data = doc.data() as TirthMitraApplication;
          const appPhone = (data.mobileNumber || data.phone || '').replace(/^\+91/, '');
          return appPhone === phoneToSearch;
        })?.data() as TirthMitraApplication;
      } else {
        // Search by application ID
        application = allApplications.docs.find(doc => {
          const data = doc.data() as TirthMitraApplication;
          return data.applicationId === searchValue;
        })?.data() as TirthMitraApplication;
      }

      if (application) {
        setFoundApplication(application);
        startAnimations();
        startTimer();
      } else {
        Alert.alert('Not Found', 'No application found with the provided details.');
      }
    } catch (error: any) {
      console.error('Error searching application:', error);
      Alert.alert('Error', 'Failed to search application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!foundApplication?.applicationId) return;

    try {
      setIsLoading(true);
      
      const allApplications = await firestore()
        .collection('tirthMitraApplications')
        .get();
      
      const currentApplication = allApplications.docs.find(
        doc => doc.data().applicationId === foundApplication.applicationId
      )?.data() as TirthMitraApplication;
      
      if (currentApplication) {
        setFoundApplication(currentApplication);
      }
    } catch (error) {
      console.error('Error refreshing application:', error);
      Alert.alert('Error', 'Failed to refresh application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!foundApplication) return;

    try {
      setIsGeneratingPDF(true);

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Tirth Mitra Card</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #333;
            }
            .card {
              background: white;
              border-radius: 15px;
              padding: 30px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.3);
              max-width: 400px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #667eea;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #667eea;
              margin: 0;
            }
            .subtitle {
              font-size: 14px;
              color: #666;
              margin: 5px 0 0 0;
            }
            .content {
              margin-bottom: 20px;
            }
            .field {
              margin-bottom: 10px;
              display: flex;
              justify-content: space-between;
            }
            .label {
              font-weight: bold;
              color: #555;
              flex: 1;
            }
            .value {
              color: #333;
              flex: 2;
              text-align: right;
            }
            .status {
              text-align: center;
              padding: 10px;
              border-radius: 8px;
              font-weight: bold;
              margin-top: 20px;
            }
            .status.approved {
              background: #d4edda;
              color: #155724;
              border: 1px solid #c3e6cb;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1 class="title">Tirth Mitra Card</h1>
              <p class="subtitle">International Gita Mahotsav 2025</p>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">Name:</span>
                <span class="value">${foundApplication.fullName}</span>
              </div>
              <div class="field">
                <span class="label">Father's Name:</span>
                <span class="value">${foundApplication.fatherName || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Mobile:</span>
                <span class="value">${foundApplication.mobileNumber || foundApplication.phone}</span>
              </div>
              <div class="field">
                <span class="label">Email:</span>
                <span class="value">${foundApplication.email}</span>
              </div>
              <div class="field">
                <span class="label">District:</span>
                <span class="value">${foundApplication.selectedDistrict || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Tirth:</span>
                <span class="value">${foundApplication.selectedTirthName || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Application ID:</span>
                <span class="value">${foundApplication.applicationId}</span>
              </div>
            </div>
            <div class="status ${foundApplication.status}">
              Status: ${foundApplication.status.toUpperCase()}
            </div>
            <div class="footer">
              <p>This card is valid for International Gita Mahotsav 2025</p>
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const options = {
        html: htmlContent,
        fileName: `TirthMitra_${foundApplication.applicationId}`,
        directory: 'Documents',
      };

      const pdf = await RNHTMLtoPDF.convert(options);
      
      Alert.alert(
        'PDF Generated Successfully!',
        `PDF saved to: ${pdf.filePath}`,
        [
          {
            text: 'Share',
            onPress: () => sharePDF(pdf.filePath),
          },
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const sharePDF = async (filePath: string) => {
    try {
      await Share.share({
        url: `file://${filePath}`,
        title: 'Tirth Mitra Card',
        message: 'Please find my Tirth Mitra Card attached.',
      });
    } catch (error: any) {
      console.error('Error sharing PDF:', error);
      Alert.alert('Error', 'Failed to share PDF.');
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'approved':
        return { name: 'checkmark-circle', color: COLORS.success };
      case 'rejected':
        return { name: 'close-circle', color: COLORS.error };
      default:
        return { name: 'time-outline', color: COLORS.warning };
    }
  };

  const getStatusMessage = (status: ApplicationStatus) => {
    switch (status) {
      case 'approved':
        return {
          title: 'Application Approved!',
          message: 'Congratulations! Your Tirth Mitra application has been approved. You can now download your card.',
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
          message: 'Your application is currently being reviewed by our team. You will be notified once the review is complete.',
          color: COLORS.warning,
        };
    }
  };

  const renderStatusCard = () => {
    if (!foundApplication) return null;

    const statusIcon = getStatusIcon(foundApplication.status);
    const statusMessage = getStatusMessage(foundApplication.status);

    return (
      <View style={[styles.statusCard, { borderColor: statusMessage.color + '40' }]}>
        <View style={styles.statusHeader}>
          <Animated.View
            style={[
              styles.statusIconContainer,
              { backgroundColor: statusMessage.color + '20' },
              foundApplication.status === 'pending' && { transform: [{ scale: pulseAnim }] }
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

        {foundApplication.status === 'pending' && (
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

  const renderApplicationDetails = () => {
    if (!foundApplication) return null;

    return (
      <View style={styles.detailsCard}>
        <H3 color={COLORS.text.primary} weight='semiBold' size='md' style={styles.detailsTitle}>
          Application Details
        </H3>
        
        <View style={styles.detailRow}>
          <BodyText color={COLORS.text.secondary} size='sm' weight='medium'>
            Application ID:
          </BodyText>
          <BodyText color={COLORS.text.primary} size='sm' weight='semiBold'>
            {foundApplication.applicationId}
          </BodyText>
        </View>

        <View style={styles.detailRow}>
          <BodyText color={COLORS.text.secondary} size='sm' weight='medium'>
            Full Name:
          </BodyText>
          <BodyText color={COLORS.text.primary} size='sm' weight='semiBold'>
            {foundApplication.fullName}
          </BodyText>
        </View>

        <View style={styles.detailRow}>
          <BodyText color={COLORS.text.secondary} size='sm' weight='medium'>
            Mobile:
          </BodyText>
          <BodyText color={COLORS.text.primary} size='sm' weight='semiBold'>
            {foundApplication.mobileNumber || foundApplication.phone}
          </BodyText>
        </View>

        <View style={styles.detailRow}>
          <BodyText color={COLORS.text.secondary} size='sm' weight='medium'>
            Email:
          </BodyText>
          <BodyText color={COLORS.text.primary} size='sm' weight='semiBold'>
            {foundApplication.email}
          </BodyText>
        </View>

        {foundApplication.selectedTirthName && (
          <View style={styles.detailRow}>
            <BodyText color={COLORS.text.secondary} size='sm' weight='medium'>
              Tirth:
            </BodyText>
            <BodyText color={COLORS.text.primary} size='sm' weight='semiBold'>
              {foundApplication.selectedTirthName}
            </BodyText>
          </View>
        )}

        <View style={styles.detailRow}>
          <BodyText color={COLORS.text.secondary} size='sm' weight='medium'>
            Submitted On:
          </BodyText>
          <BodyText color={COLORS.text.primary} size='sm' weight='semiBold'>
            {foundApplication.submittedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
          </BodyText>
        </View>

        {foundApplication.status === 'pending' && (
          <View style={styles.detailRow}>
            <BodyText color={COLORS.text.secondary} size='sm' weight='medium'>
              Time Elapsed:
            </BodyText>
            <BodyText color={COLORS.text.primary} size='sm' weight='semiBold'>
              {formatTimeElapsed(timeElapsed)}
            </BodyText>
          </View>
        )}
      </View>
    );
  };

  const renderRemarks = () => {
    if (!foundApplication || foundApplication.status !== 'rejected' || !foundApplication.rejectionReason) {
      return null;
    }

    return (
      <View style={styles.remarksCard}>
        <H3 color={COLORS.error} weight='semiBold' size='md' style={styles.remarksTitle}>
          Rejection Reason
        </H3>
        <BodyText color={COLORS.text.secondary} size='sm' style={styles.remarksText}>
          {foundApplication.rejectionReason}
        </BodyText>
      </View>
    );
  };

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
          <H1 style={styles.headerTitle} color={COLORS.text.primary} weight='bold' size='md'>
            {foundApplication ? 'Application Status' : 'Check Status'}
          </H1>
        </View>
        {foundApplication && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={isLoading}
          >
            <Ionicons name="refresh" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        {!foundApplication && <View style={styles.placeholder} />}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Section - Only show if no application found yet */}
        {!foundApplication && (
          <View style={styles.searchSection}>
            <H2 color={COLORS.text.primary} weight='semiBold' size='md' style={styles.sectionTitle}>
              Search Application
            </H2>

            {/* Search Type Toggle */}
            <View style={styles.searchTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.searchTypeButton,
                  searchType === 'phone' && styles.searchTypeButtonActive
                ]}
                onPress={() => setSearchType('phone')}
              >
                <BodyText
                  color={searchType === 'phone' ? COLORS.white : COLORS.text.secondary}
                  size='sm'
                  weight='medium'
                >
                  Phone Number
                </BodyText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.searchTypeButton,
                  searchType === 'applicationId' && styles.searchTypeButtonActive
                ]}
                onPress={() => setSearchType('applicationId')}
              >
                <BodyText
                  color={searchType === 'applicationId' ? COLORS.white : COLORS.text.secondary}
                  size='sm'
                  weight='medium'
                >
                  Application ID
                </BodyText>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchInputContainer}>
              <TextInput
                placeholder={searchType === 'phone' ? 'Enter 10-digit mobile number' : 'Enter Application ID'}
                placeholderTextColor={COLORS.text.tertiary}
                value={searchValue}
                onChangeText={setSearchValue}
                keyboardType={searchType === 'phone' ? 'phone-pad' : 'default'}
                style={styles.searchInput}
              />
              <TouchableOpacity
                style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
                onPress={handleSearch}
                disabled={isLoading}
              >
                <Ionicons
                  name={isLoading ? 'hourglass-outline' : 'search'}
                  size={20}
                  color={isLoading ? COLORS.text.tertiary : COLORS.white}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Status Card */}
        {renderStatusCard()}

        {/* Application Details */}
        {renderApplicationDetails()}

        {/* Remarks */}
        {renderRemarks()}

        {/* Action Buttons */}
        {foundApplication && (
          <View style={styles.actionButtons}>
            {foundApplication.status === 'pending' && (
              <TouchableOpacity
                style={styles.checkStatusButton}
                onPress={handleRefresh}
                disabled={isLoading}
              >
                <ButtonTextPrimary size='md'>
                  {isLoading ? 'Checking...' : 'Check Status'}
                </ButtonTextPrimary>
              </TouchableOpacity>
            )}

            {foundApplication.status === 'approved' && (
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={generatePDF}
                disabled={isGeneratingPDF}
              >
                <Ionicons
                  name={isGeneratingPDF ? 'hourglass-outline' : 'download-outline'}
                  size={20}
                  color={COLORS.white}
                  style={styles.buttonIcon}
                />
                <ButtonTextPrimary size='md'>
                  {isGeneratingPDF ? 'Generating...' : 'Download Card'}
                </ButtonTextPrimary>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.backToHomeButton}
              onPress={() => navigation.navigate('Main')}
            >
              <ButtonTextPrimary size='md'>
                Back to Home
              </ButtonTextPrimary>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Section */}
        {foundApplication && (
          <View style={styles.infoSection}>
            <BodyText color={COLORS.text.tertiary} size='xs' style={styles.infoText}>
              {foundApplication.status === 'pending' 
                ? 'You will receive a notification once your application is reviewed. Please keep checking for updates.'
                : 'Thank you for your application. For any queries, please contact the administration team.'
              }
            </BodyText>
          </View>
        )}
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  searchTypeContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  searchTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  searchTypeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.primary,
    backgroundColor: COLORS.white,
    marginRight: 12,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: COLORS.text.tertiary,
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
  checkStatusButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  backToHomeButton: {
    backgroundColor: COLORS.primary,
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

export default TirthMitraStatusScreen;
