import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H2, H3, BodyText } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from "react-native-vector-icons/Ionicons";

type MenuScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Menu'>;

interface MenuScreenProps {
  navigation: MenuScreenNavigationProp;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const stackNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const menuItems = [
    {
      id: 'about',
      title: 'About KDB',
      icon: 'information-circle-outline',
      onPress: () => stackNavigation.navigate('AboutKDB'),
    },
    {
      id: 'administration',
      title: 'Administration',
      icon: 'people-outline',
      onPress: () => stackNavigation.navigate('Administration'),
    },
    // {
    //   id: 'divider1',
    //   type: 'divider',
    // },
    {
      id: 'museum',
      title: 'Sri Krishna Museum',
      icon: 'library-outline',
      onPress: () => stackNavigation.navigate('SriKrishnaMuseum'),
    },
    {
      id: 'jyotisar',
      title: 'Jyotisar',
      icon: 'location-outline',
      onPress: () => stackNavigation.navigate('Jyotisar'),
    },
    // {
    //   id: 'divider2',
    //   type: 'divider',
    // },
    {
      id: 'permissions',
      title: 'Permissions',
      icon: 'shield-outline',
      onPress: () => stackNavigation.navigate('Permissions'),
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings-outline',
      onPress: () => {
        // Navigate to settings - you can implement this later
        console.log('Settings pressed');
      },
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: 'log-out-outline',
      onPress: () => {
        // Handle logout logic here
        console.log('Logout pressed');
      },
      textColor: COLORS.error,
    },
  ];

  const renderMenuItem = (item: any) => {
    if (item.type === 'divider') {
      return (
        <View key={item.id} style={styles.divider} />
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.menuItem}
        onPress={item.onPress}
      >
        <View style={styles.menuItemLeft}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={item.icon} 
              size={24} 
              color={item.textColor || COLORS.text.primary} 
            />
          </View>
          <BodyText 
            style={[styles.menuItemText, item.textColor && { color: item.textColor }]}
            color={item.textColor || COLORS.text.primary}
            size='md'
            weight='medium'
          >
            {item.title}
          </BodyText>
        </View>
        <Ionicons 
          name="chevron-forward-outline" 
          size={20} 
          color={COLORS.text.tertiary} 
        />
      </TouchableOpacity>
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
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <H2 style={styles.headerTitle} color={COLORS.text.primary} weight='bold' size='xl'>
          Menu
        </H2>
        <View style={styles.headerRight} />
      </View>

      {/* Menu Items */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.menuContainer}>
          {menuItems.map(renderMenuItem)}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.xl,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  menuContainer: {
    backgroundColor: COLORS.background.primary,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border.light,
    marginVertical: 8,
  },
});

export default MenuScreen;
