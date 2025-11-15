import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import EventsScreen from '../screens/events/EventScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import GitaMahotsavColorsScreen from '../screens/events/GitaMahotsavColorsScreen';
import CulturalEventsScreen from '../screens/events/CulturalEventsScreen';
import FacilitiesScreen from '../screens/facilities/FacilitiesScreen';
import FacilityMapScreen from '../screens/facilities/FacilityMapScreen';
import MuseumShowsScreen from '../screens/museum/MuseumShowsScreen';
import IconicPlacesScreen from '../screens/main/IconicPlacesScreen';
import ChatBotScreen from '../screens/chat/ChatBotScreen';
import StallsLandingScreen from '../screens/stalls/StallsLandingScreen';
import StallsScreen from '../screens/stalls/StallsScreen';
import StallsMainScreen from '../screens/stalls/StallsMainScreen';
import StallCategoriesScreen from '../screens/stalls/StallCategoriesScreen';
import StallDetailScreen from '../screens/stalls/StallDetailScreen';
import CheckApplicationStatusScreen from '../screens/stalls/CheckApplicationStatusScreen';
import StallApplicationScreen from '../screens/stalls/StallApplicationScreen';
import StallApplicationStatusScreen from '../screens/stalls/StallApplicationStatusScreen';
import PaymentScreen from '../screens/stalls/PaymentScreen';
import PaymentWebViewScreen from '../screens/stalls/PaymentWebViewScreen';
import TirthWebViewScreen from '../screens/main/TirthWebViewScreen';
import QuizWebViewScreen from '../screens/main/QuizWebViewScreen';
import FamilyMembersScreen from '../screens/family/FamilyMembersScreen';
import FamilyLaunchScreen from '../screens/family/FamilyLaunchScreen';
import AddFamilyMemberScreen from '../screens/family/AddFamilyMemberScreen';
import LocationMapScreen from '../screens/family/LocationMapScreen';
import TirthsScreen from '../screens/tirths/TirthsScreen';
import TirthDetailScreen from '../screens/tirths/TirthDetailScreen';
import TirthMitraIntroScreen from '../screens/tirthMitra/TirthMitraIntroScreen';
import TirthMitraGeneratorScreen from '../screens/tirthMitra/TirthMitraGeneratorScreen';
import TirthMitraCardScreen from '../screens/tirthMitra/TirthMitraCardScreen';
import TirthMitraApplicationScreen from '../screens/tirthMitra/TirthMitraApplicationScreen';
import TirthMitraReviewScreen from '../screens/tirthMitra/TirthMitraReviewScreen';
import TirthMitraStatusScreen from '../screens/tirthMitra/TirthMitraStatusScreen';
import MenuScreen from '../screens/main/MenuScreen';
import AboutKDBScreen from '../screens/main/AboutKDBScreen';
import AdministrationScreen from '../screens/main/AdministrationScreen';
import AdminPanelScreen from '../screens/admin/AdminPanelScreen';
import AdminApplicationsScreen from '../screens/admin/AdminApplicationsScreen';
import AdminTirthMitraApplicationsScreen from '../screens/admin/AdminTirthMitraApplicationsScreen';
import SriKrishnaMuseumScreen from '../screens/main/SriKrishnaMuseumScreen';
import JyotisarScreen from '../screens/main/JyotisarScreen';
import PermissionsScreen from '../screens/main/PermissionsScreen';
import ListScreen from '../screens/main/ListScreen';
import ItemDetailScreen from '../screens/main/ItemDetailScreen';
import RemindersScreen from '../screens/main/RemindersScreen';
import ShlokaMantraScreen from '../screens/main/ShlokaMantraScreen';
import UpdateDetailScreen from '../screens/main/UpdateDetailScreen';
import UpdatesListScreen from '../screens/main/UpdatesListScreen';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';
import { PermissionProvider } from '../contexts/PermissionContext';
import AuthNavigationListener from '../components/AuthNavigationListener';
import { navigationRef, flushNavigationQueue } from './navigationRef';
import { MahotsavHulchal as MahotsavHulchalItem } from '../services/FirebaseService';

// Tirth type for navigation
interface Tirth {
  id: string;
  name: string;
  alternateName: string;
  category: string;
  district: string;
  location: {
    address: string;
    coordinates: {
      latitude: number | null;
      longitude: number | null;
    };
  };
  shortDescription: string;
  description: string;
  significance: string;
  mythology: string;
  bestTimeToVisit: string;
  facilities: string[];
  images: string[];
  nearbyTirthas: string[];
  distanceFromKurukshetra: string;
  openingHours: string;
  entryFee: string;
  historicalReferences: string[];
}

// Tirth Mitra Card Data type
interface TirthMitraFormData {
  fullName: string;
  fatherName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  photoUri: string;
  selectedDistrict: string;
  selectedTirth: string;
  selectedTirthName: string;
}

// Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  Events: undefined;
  EventDetail: { eventId?: string };
  GitaMahotsavColors: undefined;
  CulturalEvents: undefined;
  Facilities: undefined;
  FacilityMap: {
    title: string;
    pdfUrl: string;
    markers?: {
      name: string;
      supervisor?: string;
      latitude: number;
      longitude: number;
    }[];
  };
  MuseumShows: undefined;
  IconicPlaces: undefined;
  ChatBot: undefined;
  Stalls: {
    initialCategory?: string;
  } | undefined;
  StallsLanding: undefined;
  StallsApplication: undefined;
  StallCategories: undefined;
  StallDetail: {
    stall: any;
  };
  CheckApplicationStatus: undefined;
  Quiz: undefined;
  StallApplication: { category: any };
  StallApplicationStatus: { 
    applicationId: string; 
    category: any; 
    formData: any; 
    status: 'pending' | 'approved' | 'rejected';
  };
  Payment: {
    applicationId: string;
    category: any;
    formData: any;
  };
  PaymentWebView: undefined;
  TirthWebView: { url: string; title?: string };
  FamilyMembers: undefined;
  FamilyLaunch: undefined;
  FamilyDashboard: { familyId: string };
  AddFamilyMember: undefined;
  LocationMap: undefined;
  Tirths: undefined;
  TirthDetail: { tirth: Tirth };
  TirthMitraIntro: undefined;
  TirthMitraGenerator: undefined;
  TirthMitraCard: { cardData: TirthMitraFormData };
  TirthMitraApplication: undefined;
  TirthMitraReview: {
    applicationData: any;
  };
  TirthMitraStatus: {
    applicationId?: string;
    applicationData?: any;
    status?: 'pending' | 'approved' | 'rejected';
  };
  Menu: undefined;
  AboutKDB: undefined;
  Administration: undefined;
  AdminPanel: undefined;
  AdminApplications: undefined;
  AdminTirthMitraApplications: undefined;
  SriKrishnaMuseum: undefined;
  Jyotisar: undefined;
  Permissions: undefined;
  NotificationSettings: undefined;
  ListScreen: {
    title: string;
    data: any[];
    type: 'mahotsav' | 'events' | 'tirths';
  };
  ItemDetailScreen: {
    id: number;
    title: string;
    image: string;
    description?: string;
    categories?: string[];
    rating?: number;
    time?: string;
    price?: number;
    location?: string;
    organizer?: string;
    contactInfo?: string;
    additionalInfo?: string;
  };
  Reminders: undefined;
  ShlokaMantra: undefined;
  UpdateDetail: {
    item: MahotsavHulchalItem;
  };
  UpdatesList: undefined;
};

export type AuthStackParamList = {
  OTPVerification: { phoneNumber: string; confirmation: any };
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Tirths: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[
              styles.tabItem,
              isFocused && styles.activeTabItem
            ]}
          >
            <Text
              style={[
                styles.tabLabel,
                isFocused ? styles.activeTabLabel : styles.inactiveTabLabel
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// Auth Stack Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      initialRouteName='Login'
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <AuthStack.Screen name='OTPVerification' component={OTPVerificationScreen} />
      <AuthStack.Screen name='Login' component={LoginScreen} />
      <AuthStack.Screen name='Register' component={RegisterScreen} />
      <AuthStack.Screen
        name='ForgotPassword'
        component={ForgotPasswordScreen}
      />
    </AuthStack.Navigator>
  );
}

// Main Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name='Home'
        component={HomeScreen}
        options={{
          tabBarLabel: 'IGM',
        }}
      />
      <Tab.Screen
        name='Tirths'
        component={TirthsScreen}
        options={{
          tabBarLabel: '48Kos',
        }}
      />
      <Tab.Screen
        name='Profile'
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Tirth Mitra',
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator
function AppNavigator() {
  return (
    <PermissionProvider>
      <NavigationContainer ref={navigationRef} onReady={flushNavigationQueue}>
        <AuthNavigationListener />
        <Stack.Navigator
          initialRouteName='Splash'
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
          }}
        >
        <Stack.Screen name='Splash' component={SplashScreen} />
        <Stack.Screen name='Onboarding' component={OnboardingScreen} />
        <Stack.Screen name='Auth' component={AuthNavigator} />
        <Stack.Screen name='Main' component={MainTabNavigator} />
        <Stack.Screen name='Events' component={EventsScreen} />
        <Stack.Screen name='EventDetail' component={EventDetailScreen} />
        <Stack.Screen name='GitaMahotsavColors' component={GitaMahotsavColorsScreen} />
        <Stack.Screen name='CulturalEvents' component={CulturalEventsScreen} />
        <Stack.Screen name='Facilities' component={FacilitiesScreen} />
        <Stack.Screen name='FacilityMap' component={FacilityMapScreen} />
        <Stack.Screen name='MuseumShows' component={MuseumShowsScreen} />
        <Stack.Screen name='IconicPlaces' component={IconicPlacesScreen} />
        <Stack.Screen name='ChatBot' component={ChatBotScreen} />
        <Stack.Screen name='StallsLanding' component={StallsLandingScreen} />
        <Stack.Screen name='Stalls' component={StallsScreen} />
        <Stack.Screen name='StallsApplication' component={StallsMainScreen} />
        <Stack.Screen name='StallCategories' component={StallCategoriesScreen} />
        <Stack.Screen name='StallDetail' component={StallDetailScreen} />
        <Stack.Screen name='CheckApplicationStatus' component={CheckApplicationStatusScreen} />
        <Stack.Screen name='StallApplication' component={StallApplicationScreen} />
        <Stack.Screen name='StallApplicationStatus' component={StallApplicationStatusScreen} />
        <Stack.Screen name='Payment' component={PaymentScreen} />
        <Stack.Screen name='PaymentWebView' component={PaymentWebViewScreen} />
        <Stack.Screen name='TirthWebView' component={TirthWebViewScreen} />
        <Stack.Screen name='Quiz' component={QuizWebViewScreen} />
        <Stack.Screen name='FamilyMembers' component={FamilyMembersScreen} />
        <Stack.Screen name='FamilyLaunch' component={FamilyLaunchScreen} />
        <Stack.Screen name='FamilyDashboard' component={FamilyMembersScreen} />
        <Stack.Screen name='AddFamilyMember' component={AddFamilyMemberScreen} />
        <Stack.Screen name='LocationMap' component={LocationMapScreen} />
        <Stack.Screen name='Tirths' component={TirthsScreen} />
        <Stack.Screen name='TirthDetail' component={TirthDetailScreen} />
        <Stack.Screen name='TirthMitraIntro' component={TirthMitraIntroScreen} />
        <Stack.Screen name='TirthMitraGenerator' component={TirthMitraGeneratorScreen} />
        <Stack.Screen name='TirthMitraCard' component={TirthMitraCardScreen} />
        <Stack.Screen name='TirthMitraApplication' component={TirthMitraApplicationScreen} />
        <Stack.Screen name='TirthMitraReview' component={TirthMitraReviewScreen} />
        <Stack.Screen name='TirthMitraStatus' component={TirthMitraStatusScreen} />
        <Stack.Screen name='Menu' component={MenuScreen} />
        <Stack.Screen name='AboutKDB' component={AboutKDBScreen} />
        <Stack.Screen name='Administration' component={AdministrationScreen} />
        <Stack.Screen name='AdminPanel' component={AdminPanelScreen} />
        <Stack.Screen name='AdminApplications' component={AdminApplicationsScreen} />
        <Stack.Screen name='AdminTirthMitraApplications' component={AdminTirthMitraApplicationsScreen} />
        <Stack.Screen name='SriKrishnaMuseum' component={SriKrishnaMuseumScreen} />
        <Stack.Screen name='Jyotisar' component={JyotisarScreen} />
        <Stack.Screen name='Permissions' component={PermissionsScreen} />
        <Stack.Screen name='ListScreen' component={ListScreen} />
        <Stack.Screen name='ItemDetailScreen' component={ItemDetailScreen} />
        <Stack.Screen name='Reminders' component={RemindersScreen} />
        <Stack.Screen name='ShlokaMantra' component={ShlokaMantraScreen} />
        <Stack.Screen name='UpdateDetail' component={UpdateDetailScreen} />
        <Stack.Screen name='UpdatesList' component={UpdatesListScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PermissionProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    paddingBottom: 8,
    paddingTop: 8,
    height: 60,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: 8,
    // paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: COLORS.background.tertiary,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  activeTabItem: {
    backgroundColor: COLORS.background.appColor,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabLabel: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
  },
  activeTabLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.white,
  },
  inactiveTabLabel: {
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.secondary,
  },
});

export default AppNavigator;
