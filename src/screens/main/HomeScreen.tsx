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
  Image,
  ImageBackground,
  Text,
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
import { usePermissionContext } from '../../contexts/PermissionContext';
import Ionicons from "react-native-vector-icons/Ionicons";
import MetadataService from '../../services/MetadataService';
import UpdateBottomSheet from '../../components/UpdateBottomSheet';
import { useAuth } from '../../contexts/AuthContext';
import firestore from '@react-native-firebase/firestore';
import ReminderService, { UserReminder } from '../../services/ReminderService';
import FamilyService from '../../services/FamilyService';
import FirebaseService, { MahotsavHulchal as MahotsavHulchalItem, EventItem } from '../../services/FirebaseService';
import { GITA_MAHOTSAV_COLORS } from '../events/constants/gitaMahotsavColors';
import { BodyText as BodyTextComponent } from '../../components/Text';
import { CULTURAL_EVENTS } from '../events/constants/culturalEvents';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const stackNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { permissions } = usePermissionContext();

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

  // Mahotsav Hulchal state
  const [mahotsavHulchal, setMahotsavHulchal] = useState<MahotsavHulchalItem[]>([]);
  
  // Today's events state
  const [todaysEvents, setTodaysEvents] = useState<EventItem[]>([]);
  const [hasMoreEvents, setHasMoreEvents] = useState(false);

  const culturalEventsPreview = CULTURAL_EVENTS.slice(0, 3);

  // Reverse geocoding function to convert coordinates to address
  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'KDBRevampApp/1.0', // Required by Nominatim
          },
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      const address = data.address;

      if (!address) {
        return 'Location not found';
      }

      // Build address string: City, State, Country Code
      const parts: string[] = [];
      
      if (address.city) {
        parts.push(address.city);
      } else if (address.town) {
        parts.push(address.town);
      } else if (address.village) {
        parts.push(address.village);
      }

      if (address.state) {
        parts.push(address.state);
      }

      if (address.country_code) {
        parts.push(address.country_code.toUpperCase());
      }

      return parts.length > 0 ? parts.join(', ') : 'Location not found';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Location not found';
    }
  };
  
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

  // Get user's current location and address
  useEffect(() => {
    const getCurrentAddress = async () => {
      try {
        // Check if location permission is granted
        if (permissions.location === 'granted') {
          Geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              // Use reverse geocoding to get address
              const address = await reverseGeocode(latitude, longitude);
              setUserAddress(address || 'Kurukshetra, Haryana, India');
            },
            (error) => {
              console.error('Error getting location:', error);
              // PHASE 1: Hide location error alerts
              // Handle different error types silently
              // if (error.code === 1) {
              //   Alert.alert('Permission Denied', 'Location permission was denied. Please enable location access in settings.');
              // } else if (error.code === 2) {
              //   Alert.alert('Location Unavailable', 'Unable to get your current location. Please check your GPS settings.');
              // } else if (error.code === 3) {
              //   Alert.alert('Timeout', 'Location request timed out. Please try again.');
              // } else {
              //   Alert.alert('Location Error', 'Unable to get your location. Using default address.');
              // }
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

  // Subscribe to user's reminders for list on Home - only show active reminders
  useEffect(() => {
    if (!user?.id) {
      setReminders([]);
      return;
    }
    const unsubscribe = ReminderService.subscribeToReminders(user.id, (list) => {
      const now = new Date();
      const activeReminders = list.filter(r => {
        // Only show scheduled reminders where the event hasn't passed
        if (r.status !== 'scheduled') return false;
        
        // Check if event start time is in the future
        if (r.eventStartAtUTC) {
          const eventStart = new Date(r.eventStartAtUTC);
          return eventStart > now;
        }
        
        // Fallback: check notification time if eventStartAtUTC is not available
        if (r.notifyAtUTC) {
          const notifyAt = new Date(r.notifyAtUTC);
          return notifyAt > now;
        }
        
        return true; // If no time info, show it (shouldn't happen, but safe fallback)
      });
      setReminders(activeReminders);
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

  const refreshLocation = async () => {
    if (permissions.location === 'granted') {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Use reverse geocoding to get address
          const address = await reverseGeocode(latitude, longitude);
          setUserAddress(address || 'Kurukshetra, Haryana, India');
          Alert.alert('Location Updated', `Address: ${address || 'Location not found'}`);
        },
        (error) => {
          console.error('Error refreshing location:', error);
          // PHASE 1: Hide location error alerts
          // Alert.alert('Location Error', 'Unable to refresh location. Please check your GPS settings.');
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

  // Fetch Mahotsav Hulchal from Firebase
  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeToMahotsavHulchal((items) => {
      setMahotsavHulchal(items);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch and filter today's events from Firebase
  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeToEvents((events) => {
      // Format today's date as DD-MM-YYYY
      const today = new Date();
      const day = today.getDate().toString().padStart(2, '0');
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const year = today.getFullYear();
      const todayDateStr = `${day}-${month}-${year}`;
      
      // Filter events for today
      const filteredEvents = events.filter(event => {
        // Normalize date formats for comparison (handle both DD-MM-YYYY and DD/MM/YYYY)
        const eventDate = event.date.replace(/\//g, '-');
        return eventDate === todayDateStr;
      });

      // Set hasMoreEvents flag if there are more than 3
      setHasMoreEvents(filteredEvents.length > 3);
      
      // Take only first 3 events for display
      setTodaysEvents(filteredEvents.slice(0, 3));
    });

    return () => {
      unsubscribe();
    };
  }, []);

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



  const tirthsList = [

    {
      id: 1,
      title: 'IGM Indonesia',
      image: 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2FmahotsavAroundWorld%2Findonesai.jpg?alt=media&token=fadd6a6e-a035-42c8-90b6-d9a217c3a7c5',
      categories: ['Cultural Tour'],
      price: 28,
      isFavorite: true,
      rating:false,
      time:'2025',
      link:'https://internationalgitamahotsav.in/igm-indonesia/'
    },
  

    {
      id: 2,
      title: 'IGM Canada',
      image: 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2FmahotsavAroundWorld%2Fcanada.jpg?alt=media&token=ca284451-f176-4163-bcd4-1782de68ef4d',
      categories: ['Cultural Tour'],
      price: 28,
      isFavorite: true,
      rating:false,
      time:'2024',
      link:'https://internationalgitamahotsav.in/igm-canada/'
    },
    {
      id: 3,
      title: 'IGM Australia',
      image: 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2FmahotsavAroundWorld%2FfallbackImg.jpg?alt=media&token=dbadb981-b36b-4188-b530-00fd77a5b278',
      categories: ['Cultural Tour'],
      price: 28,
      isFavorite: true,
      rating:false,
      time:'2023',
      link:'https://internationalgitamahotsav.in/igm-australia/'
    },
    {
      id: 4,
      title: 'IGM UK',
      image: 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2FmahotsavAroundWorld%2FfallbackImg.jpg?alt=media&token=dbadb981-b36b-4188-b530-00fd77a5b278',
      categories: ['Cultural Tour'],
      price: 28,
      isFavorite: true,
      rating:false,
      time:'2023',
      link:'https://internationalgitamahotsav.in/igm-united-kingdom/'
    },
    {
      id: 5,
      title: 'IGM Mauritius',
      image: 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2FmahotsavAroundWorld%2FfallbackImg.jpg?alt=media&token=dbadb981-b36b-4188-b530-00fd77a5b278',
      categories: ['Cultural Tour'],
      price: 28,
      isFavorite: true,
      rating:false,
      time:'2022',
      link:'https://internationalgitamahotsav.in/igm-mauritius/'
    },
    {
      id: 6,
      title: 'IGM SriLanka',
      image: 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2FmahotsavAroundWorld%2FfallbackImg.jpg?alt=media&token=dbadb981-b36b-4188-b530-00fd77a5b278',
      categories: ['Cultural Tour'],
      price: 28,
      isFavorite: true,
      rating:false,
      time:'2022',
      link:'https://internationalgitamahotsav.in/igm-sri-lanka/'
    }
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
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../assets/images/igmLogo.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
                <H5 style={styles.headerTitle} weight="semiBold" size='xs'>
                  International Gita Mahotsav 2025
                </H5>
              </View>
              {/* <View>
                <BodyTextComponent color={COLORS.text.secondary} size='xs' style={{ marginTop: 5,fontSize: 10}}>Managed by Kurukshetra Development Board</BodyTextComponent>
              </View> */}
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
        <H5 style={styles.quickLinkTitle} color={COLORS.primary} weight='semiBold' size='md'>Quick Links</H5>
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
          <QuickLinkItem 
            key="cultural-events" 
            icon="musical-notes-outline" 
            label="Cultural Events" 
            onPress={() => stackNavigation.navigate('CulturalEvents')}
          />
          <QuickLinkItem 
            key="facilities"
            icon="medkit-outline"
            label="Facilities"
            onPress={() => {
              stackNavigation.navigate('Facilities');
            }}
          />
          <QuickLinkItem 
            key="museumshows-secondary"
            icon="color-palette-outline"
            label="Museums & Shows"
            onPress={() => stackNavigation.navigate('MuseumShows')}
          />  
          <QuickLinkItem 
            key="Exhibitions-1" 
            icon="calendar-outline" 
            label="Exhibitions" 
            onPress={() => {
              Alert.alert(
                'Coming Soon',
                'Exhibitions will be available soon. Stay tuned!',
                [{ text: 'OK' }]
              );
            }}
          />
        </ScrollView>
        {/* <H5 style={styles.quickLinkTitle} color={COLORS.primary} weight='semiBold' size='md'>Public Facilities Links</H5> */}

<ScrollView 
  horizontal 
  showsHorizontalScrollIndicator={false}
  style={styles.quickLinkContainer}
  contentContainerStyle={styles.quickLinkContent}
>

<QuickLinkItem 
        key="stalls" 
        icon="cart-outline" 
        label="Stalls Info" 
        onPress={() => {
          Alert.alert(
            'Coming Soon',
            'Stalls Directory will be available soon. Stay tuned!',
            [{ text: 'OK' }]
          );
        }}
      />
{/* <QuickLinkItem 
key="stalls" 
icon="cart-outline" 
label="Fun Fair" 
onPress={() => {
  Alert.alert(
    'Coming Soon',
    'Amusement feature will be available soon. Stay tuned!',
    [{ text: 'OK' }]
  );
}}
/> */}
<QuickLinkItem 
        key="hotels" 
        icon="bed-outline" 
        label="Live Shows" 
        onPress={() => {
          Alert.alert(
            'Coming Soon',
            'Live Shows feature will be available soon. Stay tuned!',
            [{ text: 'OK' }]
          );
        }}
      />

{/* <QuickLinkItem 
  key="funfair-secondary"
  icon="color-palette-outline"
  label="Fun Fair"
  onPress={() => stackNavigation.navigate('MuseumShows')}
/> */}

</ScrollView>

        <View style={{ marginTop: 16 }}>
          <MahotsavHulchal listData={mahotsavHulchal} type="mahotsav" />
        </View>
      
        {/* <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.quickLinkContainer}
          contentContainerStyle={styles.quickLinkContent}
        >
        <QuickLinkItem 
          key="events-1" 
          icon="calendar-outline" 
          label="Exhibitions" 
          onPress={() => stackNavigation.navigate('Events')}
        />
         <QuickLinkItem 
          key="quiz"
          icon="school-outline"
          label="Fun Fair"
          onPress={() => {
          stackNavigation.navigate('Quiz' as any);
          }}
      />
      <QuickLinkItem 
        key="stalls" 
        icon="cart-outline" 
        label="Stalls Directory" 
        onPress={() => {
          Alert.alert(
            'Coming Soon',
            'Stalls Directory feature will be available soon. Stay tuned!',
            [{ text: 'OK' }]
          );
        }}
      />
      <QuickLinkItem 
        key="hotels" 
        icon="bed-outline" 
        label="Live Shows" 
        onPress={() => {
          Alert.alert(
            'Coming Soon',
            'Live Shows feature will be available soon. Stay tuned!',
            [{ text: 'OK' }]
          );
        }}
      />
     
        </ScrollView> */}
        
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

        {/* Gita Mahotsav Colors CTA */}
        <View style={styles.mahotsavTabContainer}>
          <TouchableOpacity
            style={styles.mahotsavTab}
            activeOpacity={0.85}
            onPress={() => stackNavigation.navigate('GitaMahotsavColors')}
          >
            <View style={styles.mahotsavTabTextWrapper}>
              <H5 color={COLORS.primary} weight='semiBold' size='lg'>
                18 Colors of Gita Mahotsav
              </H5>
              <BodyText color={COLORS.text.secondary} size='sm'>
                Explore all {GITA_MAHOTSAV_COLORS.length} vibrant celebrations
              </BodyText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Cultural Events Section */}
        <View style={styles.culturalEventsSection}>
          <View style={styles.culturalEventsHeader}>
            <H5 color={COLORS.text.primary} weight='semiBold' size='lg'>
              Cultural Events
            </H5>
            <TouchableOpacity onPress={() => stackNavigation.navigate('CulturalEvents')}>
              <BodyText color={COLORS.background.appColor} size='xs' weight='semiBold'>
                View all →
              </BodyText>
            </TouchableOpacity>
          </View>
          <View style={styles.culturalEventsList}>
            {culturalEventsPreview.map((event, index) => (
              <TouchableOpacity
                key={event.id}
                activeOpacity={0.8}
                style={[
                  styles.culturalEventCard,
                  index !== culturalEventsPreview.length - 1 && styles.culturalEventCardSpacing,
                ]}
                onPress={() => stackNavigation.navigate('CulturalEvents')}
              >
                <Image source={{ uri: event.image }} style={styles.culturalEventImage} resizeMode='cover' />
                <View style={styles.culturalEventContent}>
                  <BodyText color={COLORS.text.primary} size='md' weight='semiBold'>
                    {event.title}
                  </BodyText>
                  <BodyText color={COLORS.background.appColor} size='xs' weight='semiBold' style={{ marginTop: 2 }}>
                    {event.artist}
                  </BodyText>
                  <BodyText color={COLORS.text.secondary} size='xs' style={{ marginTop: 8 }}>
                    {event.date} • {event.time}
                  </BodyText>
                  <BodyText color={COLORS.text.secondary} size='xs'>
                    {event.venue}
                  </BodyText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Prepare for Shloka Mantra Section */}
        <TouchableOpacity 
          style={styles.shlokaMantraCard}
          onPress={() => {
            stackNavigation.navigate('ShlokaMantra' as any);
          }}
          activeOpacity={0.9}
        >
          <ImageBackground
            source={{
              uri: 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2Fvaishvika.jpeg?alt=media&token=a3e1e33c-c963-4d34-8a73-a176a5a00baf',
            }}
            style={styles.shlokaBackgroundImage}
            imageStyle={styles.shlokaBackgroundImageRadius}
          >
            <View style={styles.shlokaOverlay}>
              <View style={styles.shlokaMantraContent}>
                <View style={styles.shlokaTextContainer}>
                  <View style={styles.shlokaBadge}>
                    <Ionicons name="musical-notes-outline" size={18} color={COLORS.white} />
                    <BodyText color='rgba(255,255,255,0.9)' size='xs' weight='semiBold' style={styles.shlokaBadgeText}>
                      Vaishvik Path on 1st December
                    </BodyText>
                  </View>
                  <H5 color={COLORS.white} weight='semiBold' size='lg' style={styles.shlokaHeadline}>
                    Prepare Your Spirit for Shloka Mantra.
                  </H5>
                  <BodyText color='rgba(255,255,255,0.95)' size='sm' weight='semiBold'>
                  Shloka Mantra chanting will be performed by 18,000 students.
                  </BodyText>
                </View>
                <View style={styles.shlokaAction}>
                  <Ionicons name="arrow-forward" size={22} color={COLORS.primary} />
                </View>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
     

        
        <View style={{ marginTop: 20 }}>
          <TodaysEvents listData={todaysEvents} type="events" showAll={hasMoreEvents} />
        </View>
      
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

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        activeOpacity={0.9}
        onPress={() => stackNavigation.navigate('ChatBot')}
      >
        <Ionicons name="chatbubbles-outline" size={24} color={COLORS.white} />
        <Text style={styles.fabLabel}>Ask me</Text>
      </TouchableOpacity>

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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontFamily: FONTS.gilroy.semiBold,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  mahotsavTabContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 12,
  },
  mahotsavTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  mahotsavTabTextWrapper: {
    flex: 1,
    marginRight: 12,
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
  shlokaMantraCard: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  shlokaBackgroundImage: {
    width: '100%',
    minHeight: 180,
    justifyContent: 'flex-end',
  },
  shlokaBackgroundImageRadius: {
    borderRadius: 16,
  },
  shlokaOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  shlokaMantraContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  shlokaTextContainer: {
    flex: 1,
    marginRight: 12,
    gap: 8,
  },
  shlokaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  shlokaBadgeText: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  shlokaHeadline: {
    lineHeight: 24,
  },
  shlokaAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
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
  fab: {
    position: 'absolute',
    right: 6,
    backgroundColor: COLORS.background.appColor,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    gap: 8,
  },
  fabLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.white,
  },
  culturalEventsSection: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  culturalEventsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  culturalEventsList: {
    marginTop: 4,
  },
  culturalEventCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  culturalEventImage: {
    width: 90,
    height: 110,
  },
  culturalEventContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  culturalEventCardSpacing: {
    marginBottom: 12,
  },
});

export default HomeScreen;
