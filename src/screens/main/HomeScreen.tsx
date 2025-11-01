import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H1, H2, H3, BodyText, ButtonTextPrimary, H4, H5 } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import SpotlightCard from '../../components/cards/SpotlightCard';
import HorizontalListViews from '../../components/lists/HorizontalListViews';
import QuickLinkItem from '../../components/QuickLinks';
import MahotsavHulchal from './components/MahotsavHulchal';
import TirthsList from './components/TirthsList';
import TodaysEvents from '../events/components/TodaysEvents';
import PermissionBottomSheet from '../../components/PermissionBottomSheet';
import { usePermissionContext } from '../../contexts/PermissionContext';
import Ionicons from "react-native-vector-icons/Ionicons";
import MetadataService from '../../services/MetadataService';
import UpdateBottomSheet from '../../components/UpdateBottomSheet';
import { useAuth } from '../../contexts/AuthContext';
import firestore from '@react-native-firebase/firestore';
import ReminderService, { UserReminder } from '../../services/ReminderService';
import FamilyService from '../../services/FamilyService';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const stackNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [showPermissionSheet, setShowPermissionSheet] = useState(false);
  const { allGranted, hasShownPermissionPrompt, setHasShownPermissionPrompt, permissions } = usePermissionContext();

  // Animation values for family illustration
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const member1Anim = useRef(new Animated.Value(0)).current;
  const member2Anim = useRef(new Animated.Value(0)).current;
  const member3Anim = useRef(new Animated.Value(0)).current;
  const member4Anim = useRef(new Animated.Value(0)).current;
  const lineAnim = useRef(new Animated.Value(0)).current;

  // Date-based visibility for Apply for Stalls section
  const [showApplyStalls, setShowApplyStalls] = useState(false);
  
  // User address state
  const [userAddress, setUserAddress] = useState('Kurukshetra, Haryana, India');
  
  // Update check state
  const [showUpdateSheet, setShowUpdateSheet] = useState(false);
  const [updateData, setUpdateData] = useState<{
    title: string;
    message: string;
    forceUpdate: boolean;
  } | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [reminders, setReminders] = useState<UserReminder[]>([]);
  

  // Check if Apply for Stalls section should be visible (until November 7th)
  useEffect(() => {
    const currentDate = new Date();
    // Set deadline to November 7th, 2024 at end of day
    const deadlineDate = new Date(2024, 10, 7, 23, 59, 59); // Month is 0-indexed, so 10 = November
    
    console.log('Current Date:', currentDate);
    console.log('Deadline Date:', deadlineDate);
    console.log('Current Date String:', currentDate.toDateString());
    console.log('Deadline Date String:', deadlineDate.toDateString());
    console.log('Should show stalls:', currentDate <= deadlineDate);
    
    // TEMPORARY: Always show for testing - remove this line later
    setShowApplyStalls(true);
    
    
    // Show the section if current date is before or on November 7th
    // if (currentDate <= deadlineDate) {
    //   setShowApplyStalls(true);
    //   console.log('Apply for Stalls section will be shown');
    // } else {
    //   setShowApplyStalls(false);
    //   console.log('Apply for Stalls section will be hidden');
    // }
  }, []);

  // Check permissions on screen focus - only show if not all granted
  useEffect(() => {
    if (!allGranted && !hasShownPermissionPrompt) {
      // Show permission sheet after a short delay to let the screen load
      const timer = setTimeout(() => {
        setShowPermissionSheet(true);
        setHasShownPermissionPrompt(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    // If all permissions are granted, don't show permission sheet
    if (allGranted) {
      setShowPermissionSheet(false);
    }
  }, [allGranted, hasShownPermissionPrompt, setHasShownPermissionPrompt]);

  // Get user's current location and address
  useEffect(() => {
    const getCurrentAddress = async () => {
      try {
        // Check if location permission is granted
        if (permissions.location === 'granted') {
          Geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              Alert.alert('Location:', `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
              // For now, just use a simplified address format
              // You can enhance this to use reverse geocoding if needed
              setUserAddress(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
            },
            (error) => {
              console.error('Error getting location:', error);
              // Handle different error types
              if (error.code === 1) {
                Alert.alert('Permission Denied', 'Location permission was denied. Please enable location access in settings.');
              } else if (error.code === 2) {
                Alert.alert('Location Unavailable', 'Unable to get your current location. Please check your GPS settings.');
              } else if (error.code === 3) {
                Alert.alert('Timeout', 'Location request timed out. Please try again.');
              } else {
                Alert.alert('Location Error', 'Unable to get your location. Using default address.');
              }
              // Keep default address on error
              setUserAddress('Kurukshetra, Haryana, India');
            },
            { 
              enableHighAccuracy: true, 
              timeout: 15000, 
              maximumAge: 300000 
            }
          );
        } else {
          // If permission not granted, show default address
          setUserAddress('Kurukshetra, Haryana, India');
        }
      } catch (error) {
        console.error('Error in getCurrentAddress:', error);
        setUserAddress('Kurukshetra, Haryana, India');
      }
    };

    getCurrentAddress();
  }, [permissions.location]);

  // Check for app updates on screen mount
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // Fetch metadata
        await MetadataService.fetchMetadata(true);
        
        // Check if update is required
        const needsUpdate = await MetadataService.checkForUpdate();
        const metadata = MetadataService.getMetadata();
        
        if (needsUpdate && metadata) {
          console.log('🔔 Update available for existing user');
          setUpdateData({
            title: metadata.updateTitle,
            message: metadata.updateMessage,
            forceUpdate: metadata.updateRequired,
          });
          setShowUpdateSheet(true);
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    checkForUpdates();
  }, []);

  // Fetch current user's name from Firestore
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        if (!user?.id) {
          setFirstName(null);
          return;
        }
        const doc = await firestore().collection('users').doc(user.id).get();
        if (doc.exists) {
          const data = doc.data() as any;
          const name = (data?.firstName as string) || '';
          setFirstName(name ? name : null);
        } else {
          setFirstName(null);
        }
      } catch (e) {
        setFirstName(null);
      }
    };
    fetchUserName();
  }, [user?.id]);

  // Subscribe to user's reminders for list on Home
  useEffect(() => {
    if (!user?.id) {
      setReminders([]);
      return;
    }
    const unsubscribe = ReminderService.subscribeToReminders(user.id, (list) => {
      setReminders(list.filter(r => r.status === 'scheduled'));
    });
    return () => unsubscribe();
  }, [user?.id]);

  const handleUpdatePress = () => {
    // Open app store
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/app/your-app-id');
    } else {
      Linking.openURL('https://play.google.com/store/apps/details?id=com.yourapp');
    }
  };

  const handleDismissUpdate = () => {
    // Only allow dismiss if NOT a force update
    if (!updateData?.forceUpdate) {
      console.log('✅ Non-force update dismissed - continuing');
      setShowUpdateSheet(false);
    } else {
      console.log('🚫 Force update - dismiss blocked');
      // Don't allow dismiss on force update
    }
  };

  const refreshLocation = () => {
    if (permissions.location === 'granted') {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          Alert.alert('Location Updated:', `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
          setUserAddress(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
        },
        (error) => {
          console.error('Error refreshing location:', error);
          Alert.alert('Location Error', 'Unable to refresh location. Please check your GPS settings.');
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 0 // Force fresh location
        }
      );
    } else {
      Alert.alert('Permission Required', 'Location permission is required to get your current address.');
    }
  };

  // Animation effects for family illustration
  useEffect(() => {
    // Pulse animation for location pin
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

    // Staggered animation for family members
    const memberAnimations = Animated.stagger(200, [
      Animated.timing(member1Anim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(member2Anim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(member3Anim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(member4Anim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]);

    // Connection lines animation
    const lineAnimation = Animated.timing(lineAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });

    // Start animations
    pulseAnimation.start();
    memberAnimations.start();
    lineAnimation.start();

    return () => {
      pulseAnimation.stop();
      memberAnimations.stop();
      lineAnimation.stop();
    };
  }, []);

  const handlePermissionGranted = () => {
    setShowPermissionSheet(false);
  };

  const handlePermissionSkip = () => {
    setShowPermissionSheet(false);
  };

  const quickActions = [
    { id: 1, title: 'Transfer Money', icon: '💸', color: COLORS.primary },
    { id: 2, title: 'Pay Bills', icon: '📄', color: COLORS.info },
    { id: 3, title: 'Deposit Check', icon: '📷', color: COLORS.success },
    { id: 4, title: 'View Statements', icon: '📊', color: COLORS.warning },
  ];

  const recentTransactions = [
    {
      id: 1,
      description: 'Coffee Shop',
      amount: '-$4.50',
      date: 'Today',
      type: 'debit',
    },
    {
      id: 2,
      description: 'Salary Deposit',
      amount: '+$3,500.00',
      date: 'Yesterday',
      type: 'credit',
    },
    {
      id: 3,
      description: 'Grocery Store',
      amount: '-$89.32',
      date: '2 days ago',
      type: 'debit',
    },
    {
      id: 4,
      description: 'ATM Withdrawal',
      amount: '-$100.00',
      date: '3 days ago',
      type: 'debit',
    },
  ];

  const mahotsavHulchal = [
    {
      id: 1,
      title: 'Cultural Dance Performance',
      image: 'https://picsum.photos/600/400',
      categories: ['Dance', 'Cultural'],
      description: 'Traditional Indian classical dance performance by renowned artists showcasing the rich cultural heritage of India.',
      rating: 4.8,
      time: '7:00 PM - 9:00 PM',
      price: 150,
      location: 'Main Stage, Kurukshetra',
      organizer: 'KDB Cultural Society',
      contactInfo: '+91 98765 43210',
      additionalInfo: 'Free entry for children under 12. Photography allowed. Traditional attire recommended.',
    },
    {
      id: 2,
      title: 'Spiritual Discourse',
      image: 'https://picsum.photos/600/400',
      categories: ['Spiritual', 'Lecture'],
      description: 'Enlightening discourse on Bhagavad Gita by spiritual leaders, providing deep insights into ancient wisdom.',
      rating: 4.9,
      time: '6:00 PM - 7:30 PM',
      price: 0,
      location: 'Temple Hall, Kurukshetra',
      organizer: 'Spiritual Foundation',
      contactInfo: '+91 98765 43211',
      additionalInfo: 'Open to all. No registration required. Traditional seating on floor.',
    },
    {
      id: 3,
      title: 'Art Exhibition',
      image: 'https://picsum.photos/600/400',
      categories: ['Art', 'Exhibition'],
      description: 'Contemporary and traditional art exhibition showcasing local talent and creative expressions.',
      rating: 4.6,
      time: '10:00 AM - 6:00 PM',
      price: 50,
      location: 'Art Gallery, Kurukshetra',
      organizer: 'KDB Art Society',
      contactInfo: '+91 98765 43212',
      additionalInfo: 'Artworks available for purchase. Guided tours available every hour.',
    },
    {
      id: 4,
      title: 'Food Festival',
      image: 'https://picsum.photos/600/400',
      categories: ['Food', 'Festival'],
      description: 'Delicious traditional and modern cuisine from across India, celebrating the diverse flavors of our nation.',
      rating: 4.7,
      time: '12:00 PM - 10:00 PM',
      price: 200,
      location: 'Food Court, Kurukshetra',
      organizer: 'KDB Food Committee',
      contactInfo: '+91 98765 43213',
      additionalInfo: 'Vegetarian and non-vegetarian options available. Cash and card payments accepted.',
    },
    {
      id: 5,
      title: 'Music Concert',
      image: 'https://picsum.photos/600/400',
      categories: ['Music', 'Concert'],
      description: 'Soulful devotional music concert featuring famous artists performing classical and contemporary pieces.',
      rating: 4.9,
      time: '8:00 PM - 10:30 PM',
      price: 300,
      location: 'Concert Hall, Kurukshetra',
      organizer: 'KDB Music Society',
      contactInfo: '+91 98765 43214',
      additionalInfo: 'Limited seating. Advance booking recommended. Age restriction: 12+',
    },
    {
      id: 6,
      title: 'Workshop on Yoga',
      image: 'https://picsum.photos/600/400',
      categories: ['Yoga', 'Wellness'],
      description: 'Learn ancient yoga techniques from certified instructors and experience the benefits of this ancient practice.',
      rating: 4.5,
      time: '5:00 AM - 7:00 AM',
      price: 100,
      location: 'Yoga Hall, Kurukshetra',
      organizer: 'KDB Wellness Center',
      contactInfo: '+91 98765 43215',
      additionalInfo: 'Yoga mats provided. Bring comfortable clothing. All levels welcome.',
    },
  ];

  const tirthsList = [

    {
      id: 1,
      title: 'Kuala Lumpur, Indonesia',
      image: 'https://picsum.photos/600/400',
      categories: ['Cultural Tour'],
      price: 28,
      isFavorite: true,
      rating:false,
      time:'2025',
    },
  

    {
      id: 2,
      title: 'Toronto, Canada',
      image: 'https://picsum.photos/600/400',
      categories: ['Cultural Tour'],
      price: 28,
      isFavorite: true,
      rating:false,
      time:'2024',
    },
    {
      id: 3,
      title: 'Sydney, Australia',
      image: 'https://picsum.photos/600/400',
      categories: ['Cultural Tour'],
      price: 28,
      isFavorite: true,
      rating:false,
      time:'2023',
    },
    {
      id: 4,
      title: 'London, UK',
      image: 'https://picsum.photos/600/400',
      categories: ['Cultural Tour'],
      price: 28,
      isFavorite: true,
      rating:false,
      time:'2023',
    },
    {
      id: 5,
      title: 'Mauritius',
      image: 'https://picsum.photos/600/400',
      categories: ['Cultural Tour'],
      price: 28,
      isFavorite: true,
      rating:false,
      time:'2022',
    },
  ];

  const todaysEventsDataArray = [
    {
      id: 1,
      title: 'Bhagavad Gita Recitation',
      image: 'https://picsum.photos/600/400',
      categories: ['Spiritual', 'Recitation'],
      description: 'Daily recitation of Bhagavad Gita verses with detailed explanations and spiritual insights.',
      rating: 4.9,
      time: '6:00 AM - 7:00 AM',
      price: 0,
      location: 'Temple Hall, Kurukshetra',
      organizer: 'Spiritual Foundation',
      contactInfo: '+91 98765 43220',
      additionalInfo: 'Open to all devotees. Traditional Sanskrit recitation with Hindi translation.',
    },
    {
      id: 2,
      title: 'Temple Darshan',
      image: 'https://picsum.photos/600/400',
      categories: ['Spiritual', 'Darshan'],
      description: 'Guided tour of ancient temples with historical significance and architectural marvels.',
      rating: 4.8,
      time: '8:00 AM - 10:00 AM',
      price: 25,
      location: 'Various Temples, Kurukshetra',
      organizer: 'KDB Tourism Board',
      contactInfo: '+91 98765 43221',
      additionalInfo: 'Transportation provided. Professional guide included. Photography allowed.',
    },
    {
      id: 3,
      title: 'Cultural Workshop',
      image: 'https://picsum.photos/600/400',
      categories: ['Workshop', 'Cultural'],
      description: 'Learn traditional Indian arts and crafts from master artisans and preserve our heritage.',
      rating: 4.7,
      time: '10:00 AM - 12:00 PM',
      price: 150,
      location: 'Cultural Center, Kurukshetra',
      organizer: 'KDB Cultural Society',
      contactInfo: '+91 98765 43222',
      additionalInfo: 'Materials provided. All skill levels welcome. Take home your creations.',
    },
    {
      id: 4,
      title: 'Meditation Session',
      image: 'https://picsum.photos/600/400',
      categories: ['Meditation', 'Wellness'],
      description: 'Guided meditation session for inner peace, spiritual growth, and mental well-being.',
      rating: 4.9,
      time: '5:00 PM - 6:00 PM',
      price: 0,
      location: 'Meditation Hall, Kurukshetra',
      organizer: 'KDB Wellness Center',
      contactInfo: '+91 98765 43223',
      additionalInfo: 'Cushions provided. Silent environment. All experience levels welcome.',
    },
    {
      id: 5,
      title: 'Evening Aarti',
      image: 'https://picsum.photos/600/400',
      categories: ['Aarti', 'Spiritual'],
      description: 'Traditional evening prayer ceremony with devotional songs and spiritual atmosphere.',
      rating: 4.8,
      time: '7:00 PM - 7:30 PM',
      price: 0,
      location: 'Main Temple, Kurukshetra',
      organizer: 'Temple Committee',
      contactInfo: '+91 98765 43224',
      additionalInfo: 'Open to all. Traditional dress code. Photography restricted during ceremony.',
    },
    {
      id: 6,
      title: 'Storytelling Session',
      image: 'https://picsum.photos/600/400',
      categories: ['Storytelling', 'Education'],
      description: 'Fascinating stories from Indian mythology and history, bringing ancient wisdom to life.',
      rating: 4.6,
      time: '4:00 PM - 5:00 PM',
      price: 50,
      location: 'Story Hall, Kurukshetra',
      organizer: 'KDB Education Society',
      contactInfo: '+91 98765 43225',
      additionalInfo: 'Interactive session. Q&A included. Suitable for all ages.',
    },
  ];


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with App Color Background */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.greetingContainer}>
                <BodyText style={styles.namasteIcon} size='xl'>🙏</BodyText>
                <H5 style={styles.greetingText} weight="semiBold">{`Namastey${firstName ? ", " + firstName : ''}`}</H5>
              </View>
              <View style={styles.addressContainer}>
                <BodyText style={styles.addressText} color={COLORS.text.primary} size='sm'>
                  {userAddress}
                </BodyText>
                {permissions.location === 'granted' && (
                  <TouchableOpacity 
                    style={styles.refreshLocationButton}
                    onPress={refreshLocation}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="refresh" size={16} color={COLORS.appColor} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={() => stackNavigation.navigate('Menu')}
              >
                <Ionicons name="menu-outline" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Balance Card */}
      <View style={styles.contentContainer}>
        <H5 style={styles.quickLinkTitle} color={COLORS.primary} weight='semiBold' size='lg'>Mahotsav related Links</H5>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.quickLinkContainer}
          contentContainerStyle={styles.quickLinkContent}
        >
        <QuickLinkItem 
          key="events-1" 
          icon="calendar-outline" 
          label="Events" 
          onPress={() => stackNavigation.navigate('Events')}
        />
      {/* <QuickLinkItem 
        key="stalls" 
        icon="cart-outline" 
        label="Stalls Directory" 
        onPress={() => stackNavigation.navigate('Stalls')}
      />
      <QuickLinkItem 
        key="hotels" 
        icon="bed-outline" 
        label="Live Shows" 
        onPress={() => console.log('Hotels pressed')}
      /> */}
      <QuickLinkItem 
        key="quiz" 
        icon="school-outline" 
        label="Quiz" 
        onPress={() => stackNavigation.navigate('Quiz')}
      />
        </ScrollView>
        
        {/* Reminders List */}
        {reminders.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
            <H5 color={COLORS.primary} weight='semiBold' size='lg'>Your Reminders</H5>
            {(reminders.slice(0, 2)).map((r) => (
              <TouchableOpacity
                key={r.id}
                onPress={() => stackNavigation.navigate('EventDetail', { eventId: r.eventId })}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: COLORS.background.primary,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: COLORS.border.light
                }}
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <BodyText color={COLORS.text.primary} size='sm' weight='medium'>
                    {r.title}
                  </BodyText>
                  <BodyText color={COLORS.text.secondary} size='xs'>
                    {new Date(r.notifyAtUTC).toLocaleString()}
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
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: COLORS.error
                    }}
                  >
                    <BodyText color={COLORS.error} size='xs' weight='semiBold'>Cancel</BodyText>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
            {reminders.length > 2 && (
              <TouchableOpacity
                onPress={() => stackNavigation.navigate('Reminders' as any)}
                style={{ alignSelf: 'flex-end', marginTop: 8 }}
              >
                <BodyText color={COLORS.background.appColor} size='xs' weight='semiBold'>View All →</BodyText>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Apply for Stalls - Attention Grabbing Section (Visible until November 7th) */}
        {showApplyStalls && (
          <TouchableOpacity 
            style={styles.applyStallsCard}
            onPress={() => stackNavigation.navigate('Stalls')}
            activeOpacity={0.8}
          >
            <View style={styles.applyStallsContent}>
              <View style={styles.applyStallsLeft}>
                {/* <View style={styles.applyStallsIconContainer}>
                  <Ionicons name="storefront-outline" size={28} color={COLORS.white} />
                </View> */}
                <View style={styles.applyStallsTextContainer}>
                  <H4 color={COLORS.white} weight='semiBold' size='lg'>
                    Apply for Stalls/Shops
                  </H4>
                  <BodyText color={COLORS.white} size='sm' style={styles.applyStallsDescription}>
                    Book your stall at International Gita Mahotsav 2025
                  </BodyText>
                </View>
              </View>
              <View style={styles.applyStallsRight}>
                {/* <View style={styles.applyStallsBadge}>
                  <BodyText color={COLORS.white} size='xs' weight='bold'>
                    LIMITED
                  </BodyText>
                </View> */}
                <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
              </View>
            </View>
            <View style={styles.applyStallsGradient} />
          </TouchableOpacity>
        )}

        
        <View style={{marginTop: 26}}/>
        {/* <MahotsavHulchal listData={mahotsavHulchal} type="mahotsav" />
        <TodaysEvents listData={todaysEventsDataArray} type="events" />
       */}
      <View style={styles.familyLocationCard}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.mapView}
            initialRegion={{
              latitude: 29.96321722479801,
              longitude: 76.82765492188825,
              latitudeDelta: 0.003,
              longitudeDelta: 0.003,
            }}
            mapType="standard"
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={false}
            showsScale={false}
            showsBuildings={true}
            showsTraffic={false}
            showsIndoors={false}
          />
          <View style={styles.mapOverlayLarge} />
          
          <View style={styles.contentOverlay}>
            <View style={styles.textContent}>
              <H5 color={COLORS.white} weight='semiBold' size='lg'>
                Locate your family members
              </H5>
              <TouchableOpacity 
                style={styles.overlayButton}
                onPress={async () => {
                  // Check if user has a family, if yes go to dashboard, else launch screen
                  if (user?.id) {
                    try {
                      const family = await FamilyService.getUserFamily(user.id);
                      if (family) {
                        stackNavigation.navigate('FamilyDashboard', { familyId: family.id });
                      } else {
                        stackNavigation.navigate('FamilyLaunch');
                      }
                    } catch (error) {
                      console.error('Error checking family:', error);
                      stackNavigation.navigate('FamilyLaunch');
                    }
                  } else {
                    stackNavigation.navigate('FamilyLaunch');
                  }
                }}
              >
                <BodyText 
                  color={COLORS.white} 
                  size='md' 
                  weight='semiBold'
                  style={{ fontFamily: FONTS.gilroy.bold }}
                >
                  Locate Now
                </BodyText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.markersContainer}>
              <View style={styles.familyIllustration}>
                <Animated.View 
                  style={[
                    styles.locationPin,
                    {
                      transform: [{ scale: pulseAnim }]
                    }
                  ]}
                >
                  <Ionicons name="location" size={14} color={COLORS.white} />
                </Animated.View>
                
                <View style={styles.familyMembers}>
                  <Animated.View 
                    style={[
                      styles.memberDot, 
                      styles.member1,
                      {
                        opacity: member1Anim,
                        transform: [
                          {
                            scale: member1Anim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.3, 1],
                            })
                          }
                        ]
                      }
                    ]} 
                  />
                  <Animated.View 
                    style={[
                      styles.memberDot, 
                      styles.member2,
                      {
                        opacity: member2Anim,
                        transform: [
                          {
                            scale: member2Anim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.3, 1],
                            })
                          }
                        ]
                      }
                    ]} 
                  />
                  <Animated.View 
                    style={[
                      styles.memberDot, 
                      styles.member3,
                      {
                        opacity: member3Anim,
                        transform: [
                          {
                            scale: member3Anim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.3, 1],
                            })
                          }
                        ]
                      }
                    ]} 
                  />
                  <Animated.View 
                    style={[
                      styles.memberDot, 
                      styles.member4,
                      {
                        opacity: member4Anim,
                        transform: [
                          {
                            scale: member4Anim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.3, 1],
                            })
                          }
                        ]
                      }
                    ]} 
                  />
                </View>
                
                <View style={styles.connectionLines}>
                  <Animated.View 
                    style={[
                      styles.line, 
                      styles.line1,
                      {
                        opacity: lineAnim,
                        transform: [
                          {
                            scaleX: lineAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 1],
                            })
                          }
                        ]
                      }
                    ]} 
                  />
                  <Animated.View 
                    style={[
                      styles.line, 
                      styles.line2,
                      {
                        opacity: lineAnim,
                        transform: [
                          {
                            scaleX: lineAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 1],
                            })
                          }
                        ]
                      }
                    ]} 
                  />
                  <Animated.View 
                    style={[
                      styles.line, 
                      styles.line3,
                      {
                        opacity: lineAnim,
                        transform: [
                          {
                            scaleX: lineAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 1],
                            })
                          }
                        ]
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
        <TirthsList listData={tirthsList} />
      </View>
     
        {/* <View style={styles.balanceCard}>
          <BodyText color={COLORS.background.primary} size='md' weight='medium'>
            Total Balance
          </BodyText>
          <H1
            color={COLORS.background.primary}
            weight='bold'
            size='4xl'
            style={styles.balanceAmount}
          >
            $12,456.78
          </H1>
          <View style={styles.balanceDetails}>
            <BodyText color={COLORS.background.primary} size='sm'>
              Checking: $8,456.78
            </BodyText>
            <BodyText color={COLORS.background.primary} size='sm'>
              Savings: $4,000.00
            </BodyText>
          </View>
        </View> */}

        {/* Quick Actions */}
        {/* <View style={styles.section}>
          <H2
            color={COLORS.primary}
            weight='bold'
            size='xl'
            style={styles.sectionTitle}
          >
            Quick Actions
          </H2>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(action => (
              <TouchableOpacity key={action.id} style={styles.quickActionItem}>
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: action.color + '20' },
                  ]}
                >
                  <BodyText size='2xl'>{action.icon}</BodyText>
                </View>
                <BodyText
                  color={COLORS.primary}
                  size='sm'
                  weight='medium'
                  style={styles.quickActionText}
                >
                  {action.title}
                </BodyText>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}

        {/* Recent Transactions */}
        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <H2 color={COLORS.primary} weight='bold' size='xl'>
              Recent Transactions
            </H2>
            <TouchableOpacity>
              <BodyText color={COLORS.primary} size='md' weight='medium'>
                View All
              </BodyText>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            {recentTransactions.map(transaction => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionItem}
              >
                <View style={styles.transactionLeft}>
                  <View
                    style={[
                      styles.transactionIcon,
                      {
                        backgroundColor:
                          transaction.type === 'credit'
                            ? COLORS.success + '20'
                            : COLORS.error + '20',
                      },
                    ]}
                  >
                    <BodyText size='lg'>
                      {transaction.type === 'credit' ? '📈' : '📉'}
                    </BodyText>
                  </View>
                  <View style={styles.transactionDetails}>
                    <BodyText color={COLORS.primary} size='md' weight='medium'>
                      {transaction.description}
                    </BodyText>
                    <BodyText color={COLORS.tertiary} size='sm'>
                      {transaction.date}
                    </BodyText>
                  </View>
                </View>
                <BodyText
                  color={
                    transaction.type === 'credit'
                      ? COLORS.success
                      : COLORS.error
                  }
                  size='md'
                  weight='bold'
                >
                  {transaction.amount}
                </BodyText>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}


      </ScrollView>

      {/* Permission Bottom Sheet for existing users */}
      <PermissionBottomSheet
        visible={showPermissionSheet}
        onClose={handlePermissionSkip}
        onPermissionsGranted={handlePermissionGranted}
        isOnboarding={false}
      />

      {/* Update Bottom Sheet */}
      {updateData && (
        <UpdateBottomSheet
          visible={showUpdateSheet}
          forceUpdate={updateData.forceUpdate}
          title={updateData.title}
          message={updateData.message}
          onUpdatePress={handleUpdatePress}
          onDismiss={handleDismissUpdate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary
  },
  headerContainer: {
    backgroundColor: COLORS.background.primary,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  namasteIcon: {
    marginRight: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greetingText: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
    // marginBottom: 2,
  },
  addressText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
    opacity: 0.9,
    flex: 1,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  refreshLocationButton: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 12,
    backgroundColor: COLORS.appColor + '20',
  },
  menuButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
    backgroundColor: COLORS.background.tertiary,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 24,
    marginBottom: 32,
    padding: 24,
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceAmount: {
    marginVertical: 8,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    textAlign: 'center',
  },
  transactionsList: {
    paddingHorizontal: 24,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  familyLocationCard: {
    // marginHorizontal: 20,
    height: 200,
    // borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    position: 'relative',
  },
  mapView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  mapOverlayLarge: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  contentOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  textContent: {
    flex: 1,
    paddingRight: 20,
  },
  overlayButton: {
    backgroundColor: COLORS.appColor,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    // marginTop: 10,
  },
  markersContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  familyIllustration: {
    width: 100,
    height: 100,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
  },
  mapGrid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#B8D4F0',
  },
  gridLine1: {
    top: '25%',
    left: 0,
    right: 0,
    height: 1,
  },
  gridLine2: {
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
  },
  gridLine3: {
    top: '75%',
    left: 0,
    right: 0,
    height: 1,
  },
  gridLine4: {
    left: '25%',
    top: 0,
    bottom: 0,
    width: 1,
  },
  mapOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
  },
  locationPin: {
    position: 'absolute',
    top: 15,
    left: 38,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.appColor,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  familyMembers: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  memberDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  member1: {
    top: 25,
    right: 15,
  },
  member2: {
    top: 55,
    right: 10,
  },
  member3: {
    bottom: 25,
    right: 20,
  },
  member4: {
    top: 40,
    left: 10,
  },
  connectionLines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  line: {
    position: 'absolute',
    height: 3,
    backgroundColor: COLORS.appColor,
    borderRadius: 1.5,
    shadowColor: COLORS.appColor,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  line1: {
    top: 31,
    right: 28,
    width: 25,
    transform: [{ rotate: '-30deg' }],
  },
  line2: {
    top: 61,
    right: 23,
    width: 20,
    transform: [{ rotate: '-45deg' }],
  },
  line3: {
    top: 46,
    left: 23,
    width: 30,
    transform: [{ rotate: '15deg' }],
  },
  spotlightTitle: {
    marginBottom: 6,
    paddingHorizontal: 24,
  },
  contentContainer: {
   marginTop: 20,
  },
  quickLinkContainer: {
    marginBottom: 16,
  },
  quickLinkContent: {
    paddingHorizontal: 8,
    flexDirection: 'row',
  },
  quickLinkTitle: {
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  applyStallsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  applyStallsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    zIndex: 2,
  },
  applyStallsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  applyStallsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  applyStallsTextContainer: {
    flex: 1,
  },
  applyStallsDescription: {
    marginTop: 4,
    opacity: 0.9,
    lineHeight: 18,
  },
  applyStallsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applyStallsBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  applyStallsGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
    opacity: 0.1,
  },
});

export default HomeScreen;
