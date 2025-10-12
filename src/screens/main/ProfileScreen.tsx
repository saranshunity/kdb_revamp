import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  H1,
  H2,
  H3,
  BodyText,
  ButtonTextSecondary,
} from '../../components/Text';
import { COLORS } from '../../constants/colors';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const profileSections = [
    {
      title: 'Tirth Mitra',
      items: [
        {
          id: 0,
          title: 'Generate Tirth Mitra Card',
          icon: '🎫',
          subtitle: 'Get your official pilgrimage card',
          action: () => navigation.navigate('TirthMitraIntro'),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 1,
          title: 'Personal Information',
          icon: '👤',
          subtitle: 'Update your details',
        },
        {
          id: 2,
          title: 'Security Settings',
          icon: '🔒',
          subtitle: 'Password, PIN, biometrics',
        },
        {
          id: 3,
          title: 'Notification Preferences',
          icon: '🔔',
          subtitle: 'Email, SMS, push notifications',
        },
        {
          id: 4,
          title: 'Privacy Settings',
          icon: '🛡️',
          subtitle: 'Data sharing and privacy',
        },
      ],
    },
    {
      title: 'Banking',
      items: [
        {
          id: 5,
          title: 'Account Details',
          icon: '🏦',
          subtitle: 'View account information',
        },
        {
          id: 6,
          title: 'Cards & Payments',
          icon: '💳',
          subtitle: 'Manage your cards',
        },
        {
          id: 7,
          title: 'Statements & Documents',
          icon: '📄',
          subtitle: 'Download statements',
        },
        {
          id: 8,
          title: 'Transaction History',
          icon: '📊',
          subtitle: 'View all transactions',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 9,
          title: 'Help Center',
          icon: '❓',
          subtitle: 'FAQs and guides',
        },
        {
          id: 10,
          title: 'Contact Support',
          icon: '💬',
          subtitle: 'Get in touch with us',
        },
        {
          id: 11,
          title: 'Feedback',
          icon: '💭',
          subtitle: 'Share your feedback',
        },
        {
          id: 12,
          title: 'Rate App',
          icon: '⭐',
          subtitle: 'Rate us on App Store',
        },
      ],
    },
  ];

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout pressed');
    navigation.navigate('Auth');
  };

  const handleSectionItemPress = (item: any) => {
    // Check if item has a custom action
    if (item.action) {
      item.action();
    } else {
      // TODO: Navigate to specific screens based on item
      console.log('Pressed:', item.title);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <H1 color={COLORS.primary} weight='bold' size='2xl'>
            Profile
          </H1>
          <TouchableOpacity style={styles.settingsButton}>
            <BodyText size='lg'>⚙️</BodyText>
          </TouchableOpacity>
        </View>

        {/* Profile Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <BodyText size='3xl'>👤</BodyText>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <BodyText size='sm'>✏️</BodyText>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <H2 color={COLORS.primary} weight='bold' size='xl'>
              John Doe
            </H2>
            <BodyText color={COLORS.secondary} size='md'>
              john.doe@example.com
            </BodyText>
            <BodyText color={COLORS.tertiary} size='sm'>
              Member since 2020
            </BodyText>
          </View>

          <TouchableOpacity style={styles.editProfileButton}>
            <ButtonTextSecondary size='md'>Edit Profile</ButtonTextSecondary>
          </TouchableOpacity>
        </View>

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <H3
              color={COLORS.primary}
              weight='bold'
              size='lg'
              style={styles.sectionTitle}
            >
              {section.title}
            </H3>

            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.sectionItem,
                    itemIndex === section.items.length - 1 &&
                      styles.lastSectionItem,
                  ]}
                  onPress={() => handleSectionItemPress(item)}
                >
                  <View style={styles.sectionItemLeft}>
                    <View style={styles.sectionItemIcon}>
                      <BodyText size='lg'>{item.icon}</BodyText>
                    </View>
                    <View style={styles.sectionItemText}>
                      <BodyText
                        color={COLORS.primary}
                        size='md'
                        weight='medium'
                      >
                        {item.title}
                      </BodyText>
                      <BodyText color={COLORS.tertiary} size='sm'>
                        {item.subtitle}
                      </BodyText>
                    </View>
                  </View>
                  <BodyText color={COLORS.tertiary} size='lg'>
                    ›
                  </BodyText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={styles.appInfo}>
          <BodyText color={COLORS.tertiary} size='sm' style={styles.appVersion}>
            KDB Mobile App v1.0.0
          </BodyText>
          <BodyText color={COLORS.tertiary} size='sm'>
            © 2024 KDB Bank. All rights reserved.
          </BodyText>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <BodyText color={COLORS.error} size='md' weight='medium'>
            Sign Out
          </BodyText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  settingsButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: COLORS.background.primary,
    marginHorizontal: 24,
    marginBottom: 32,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: '50%',
    marginRight: -20,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  editProfileButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  sectionContent: {
    backgroundColor: COLORS.background.primary,
    marginHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light
  },
  sectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light
  },
  lastSectionItem: {
    borderBottomWidth: 0,
  },
  sectionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionItemText: {
    flex: 1,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  appVersion: {
    marginBottom: 4,
  },
  logoutButton: {
    backgroundColor: COLORS.error + '10',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
});

export default ProfileScreen;
