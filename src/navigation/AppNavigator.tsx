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
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import EventsScreen from '../screens/events/EventScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import StallsScreen from '../screens/stalls/StallsScreen';
import FamilyMembersScreen from '../screens/family/FamilyMembersScreen';
import AddFamilyMemberScreen from '../screens/family/AddFamilyMemberScreen';
import LocationMapScreen from '../screens/family/LocationMapScreen';
import TirthsScreen from '../screens/tirths/TirthsScreen';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

// Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  Events: undefined;
  EventDetail: undefined;
  Stalls: undefined;
  FamilyMembers: undefined;
  AddFamilyMember: undefined;
  LocationMap: undefined;
  Tirths: undefined;
};

export type AuthStackParamList = {
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
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
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
    <NavigationContainer>
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
        <Stack.Screen name='Stalls' component={StallsScreen} />
        <Stack.Screen name='FamilyMembers' component={FamilyMembersScreen} />
        <Stack.Screen name='AddFamilyMember' component={AddFamilyMemberScreen} />
        <Stack.Screen name='LocationMap' component={LocationMapScreen} />
        <Stack.Screen name='Tirths' component={TirthsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
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
