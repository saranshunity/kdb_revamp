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
  Platform,
  Image,
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
import { generatePDF } from 'react-native-html-to-pdf';
import BlobUtil from 'react-native-blob-util';
import { kdblogobase64 } from '../../constants/base64/kdblogobase64';
import { hrlogobase64 } from '../../constants/base64/hrlogobase64';

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
  photoUri?: string;
  profileImage?: string;
  idCardUri?: string;
  identityDocument?: string;
  district?: string;
  selectedDistrict?: string;
  selectedTirth?: string;
  selectedTirthName?: string;
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
        console.log(`Searching for phone: ${phoneToSearch}`);
        
        allApplications.docs.forEach(doc => {
          const data = doc.data() as TirthMitraApplication;
          const appPhone = (data.mobileNumber || data.phone || '').replace(/^\+91/, '');
          console.log(`Comparing: ${appPhone} === ${phoneToSearch}`);
        });
        
        application = allApplications.docs.find(doc => {
          const data = doc.data() as TirthMitraApplication;
          const appPhone = (data.mobileNumber || data.phone || '').replace(/^\+91/, '');
          return appPhone === phoneToSearch;
        })?.data() as TirthMitraApplication;
      } else {
        // Search by application ID
        console.log(`Searching for application ID: ${searchValue}`);
        
        allApplications.docs.forEach(doc => {
          const data = doc.data() as TirthMitraApplication;
          console.log(`Comparing: ${data.applicationId} === ${searchValue}`);
        });
        
        application = allApplications.docs.find(doc => {
          const data = doc.data() as TirthMitraApplication;
          return data.applicationId === searchValue;
        })?.data() as TirthMitraApplication;
      }

      if (application) {
        console.log('Found application:', application);
        setFoundApplication(application);
        startAnimations();
        startTimer();
      } else {
        console.log('No application found with the provided details');
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

  const generatePDFApplicationCard = async () => {
    if (!foundApplication) return;
  
    try {
      setIsGeneratingPDF(true);

      // Use base64 logos from constants
      const kdbLogoBase64 = kdblogobase64;
      const hrLogoBase64 = hrlogobase64;
  
      const submittedDate = foundApplication.submittedAt?.toDate?.()?.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) || 'N/A';

            const htmlContent = `
                <!DOCTYPE html>
 <html>
 <head>
   <meta charset="UTF-8">
   <style>
     @font-face {
       font-family: 'Gilroy';
       font-weight: 400;
       src: url('data:font/truetype;charset=utf-8;base64,') format('truetype');
     }
     body {
       margin: 0;
       padding: 20px;
       background: #f7f7f7;
       display: flex;
       justify-content: center;
       align-items: center;
       min-height: 100vh;
     }
     .idcard-container {
       width: 340px;
       height: 540px;
       background: #fff;
       border-radius: 18px;
       box-shadow: 0 6px 30px rgba(44,62,100,0.10);
       border: 1.5px solid #e4e7ef;
       overflow: hidden;
       font-family: 'Gilroy', 'Arial', sans-serif;
       display: flex;
       flex-direction: row;
       margin: 20px;
     }
     .idcard-left {
       background: linear-gradient(120deg, #febd2f 85%, #fec84d 100%);
       width: 90px;
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       color: #fff;
       padding: 0 8px;
       position: relative;
     }
     .vertical-title {
       font-size: 1.35em;
       font-weight: 700;
       letter-spacing: 0.1em;
       writing-mode: vertical-rl;
       text-orientation: mixed;
       text-align: center;
       margin-top: 8px;
       margin-bottom: 8px;
       white-space: nowrap;
       transform: rotate(180deg);
     }
     .idcard-right {
       flex: 1;
       display: flex;
       flex-direction: column;
       padding: 32px 22px 16px 18px;
     }
     .idcard-header {
       display: flex;
       flex-direction: row;
       align-items: center;
       margin-bottom: 10px;
       margin-top: 4px;
     }
     .univ-logo {
       width: 32px;
       height: 32px;
       object-fit: contain;
       margin-right: 12px;
     }
     .univ-name {
       font-size: 1.08em;
       font-weight: 700;
       color: #febd2f;
       line-height: 1.15em;
     }
     .profile-photo {
       width: 94px;
       height: 110px;
       border: 2px solid #febd2f;
       border-radius: 7px;
       object-fit: cover;
       display: block;
       align-self: center;
       margin: 18px 0 18px 0;
       background: #f4f4f4;
     }
     .info-list {
       margin-top: 6px;
       font-size: 15px;
     }
     .info-list div {
       margin: 8px 0 0 0;
       display: flex;
     }
     .info-label {
       min-width: 98px;
       font-weight: 600;
       color: #febd2f;
       text-transform: uppercase;
     }
     .info-value {
       color: #18191a;
       font-weight: 400;
       margin-left: 7px;
       flex: 1;
       word-break: break-word;
       text-transform: uppercase;
     }
     .valid-until-row {
       margin-top: 18px;
       font-size: 12px;
       color: #1d2234;
     }
     .authority-section {
       margin-top: 16px;
       padding-top: 12px;
       border-top: 1px solid #e0e0e0;
       display: flex;
       align-items: center;
       justify-content: space-between;
     }
     .authority-logo {
       width: 40px;
       height: 40px;
       object-fit: contain;
     }
     .authority-text {
       font-size: 11px;
       color: #555;
       text-align: right;
     }
     .authority-label {
       font-weight: bold;
       margin-bottom: 2px;
     }
   </style>
 </head>
 <body>
      <div class="idcard-container">
     <div class="idcard-left">
       <span class="vertical-title">KURUKSHETRA DEVELOPMENT BOARD<br/>KURUKSHETRA</span>
     </div>
     <div class="idcard-right">
               <div class="idcard-header">
         <img src="${kdbLogoBase64}" alt="KDB Logo" class="univ-logo"/>
         <span class="univ-name">TIRTH MITRA</span>
       </div>
       ${(foundApplication.profileImage || foundApplication.photoUri) 
         ? `<img src="${foundApplication.profileImage || foundApplication.photoUri}" alt="Profile Photo" class="profile-photo"/>`
         : `<div class="profile-photo" style="display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px; text-align: center;">No Photo</div>`
       }
                <div class="info-list">
           <div><span class="info-label">Name:</span><span class="info-value">${foundApplication.fullName.toUpperCase()}</span></div>
           <div><span class="info-label">Mobile:</span><span class="info-value">${(foundApplication.mobileNumber || foundApplication.phone || 'N/A').toUpperCase()}</span></div>
           <div><span class="info-label">DOB:</span><span class="info-value">${(foundApplication.dateOfBirth || 'N/A').toUpperCase()}</span></div>
           ${foundApplication.selectedDistrict || foundApplication.district ? `<div><span class="info-label">District:</span><span class="info-value">${((foundApplication.selectedDistrict || foundApplication.district) || '').toUpperCase()}</span></div>` : ''}
           ${foundApplication.selectedTirthName ? `<div><span class="info-label">Tirth:</span><span class="info-value">${foundApplication.selectedTirthName.toUpperCase()}</span></div>` : ''}
         </div>
         <div class="valid-until-row">
           <strong>Issued Date:</strong> ${submittedDate}
         </div>
                 <div class="authority-section">
           <img src="${hrLogoBase64}" alt="HR Logo" class="authority-logo"/>
           <div class="authority-text">
             <div class="authority-label">AUTHORIZED BY</div>
             <div>Govt. of Haryana</div>
           </div>
         </div>
     </div>
   </div>
 </body>
 </html>

      `;
  
      const fileName = `TirthMitra_${foundApplication.applicationId || Date.now()}.pdf`;
  
      const options = {
        html: htmlContent,
        fileName,
        directory: Platform.OS === 'ios' ? 'Documents' : 'Downloads',
        width: 595,
        height: 842,
        base64: false,
      };
  
      const pdf = await generatePDF(options);
  
      let publicPath = pdf.filePath; // Default for iOS
  
      if (Platform.OS === 'android') {
        // Move to public Download folder and notify Download Manager
        const destPath = `${BlobUtil.fs.dirs.DownloadDir}/${fileName}`;
        await BlobUtil.fs.cp(pdf.filePath, destPath);
        await BlobUtil.android.addCompleteDownload({
          title: fileName,
          description: 'Tirth Mitra Card PDF',
          mime: 'application/pdf',
          path: destPath,
          showNotification: true,   // show in notification tray
          mediaScannable: true,
        });
        publicPath = destPath;
      }
  
      if (publicPath) {
        console.log('PDF successfully saved to:', publicPath);
        Alert.alert(
          'PDF Generated Successfully!',
          `PDF saved to: ${publicPath}\nYou can find it in Downloads or from the notification tray.`,
          [
            // {
            //   text: 'Share PDF',
            //   onPress: () => sharePDF(publicPath),
            // },
            {
              text: 'OK',
              style: 'default',
            },
          ]
        );
      } else {
        throw new Error('PDF generation failed - no file path returned');
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      Alert.alert(
        'Error',
        `Failed to generate PDF: ${error?.message || 'Unknown error'}`
      );
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
                  onPress={generatePDFApplicationCard}
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
