import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
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

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    biometricAuth: true,
    darkMode: false,
    autoLock: true,
    dataUsage: false,
  });

  const handleSettingToggle = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  };

  const notificationSettings = [
    {
      id: 'pushNotifications',
      title: 'Push Notifications',
      subtitle: 'Receive notifications on your device',
      enabled: settings.pushNotifications,
    },
    {
      id: 'emailNotifications',
      title: 'Email Notifications',
      subtitle: 'Get updates via email',
      enabled: settings.emailNotifications,
    },
    {
      id: 'smsNotifications',
      title: 'SMS Notifications',
      subtitle: 'Receive text message alerts',
      enabled: settings.smsNotifications,
    },
  ];

  const securitySettings = [
    {
      id: 'biometricAuth',
      title: 'Biometric Authentication',
      subtitle: 'Use fingerprint or face ID',
      enabled: settings.biometricAuth,
    },
    {
      id: 'autoLock',
      title: 'Auto Lock',
      subtitle: 'Lock app after 5 minutes of inactivity',
      enabled: settings.autoLock,
    },
  ];

  const appSettings = [
    {
      id: 'darkMode',
      title: 'Dark Mode',
      subtitle: 'Switch to dark theme',
      enabled: settings.darkMode,
    },
    {
      id: 'dataUsage',
      title: 'Data Usage',
      subtitle: 'Allow app to use mobile data',
      enabled: settings.dataUsage,
    },
  ];

  const otherOptions = [
    { id: 1, title: 'Language', subtitle: 'English', icon: '🌐' },
    { id: 2, title: 'Currency', subtitle: 'USD ($)', icon: '💵' },
    { id: 3, title: 'Time Zone', subtitle: 'UTC-5 (EST)', icon: '🕐' },
    {
      id: 4,
      title: 'Privacy Policy',
      subtitle: 'View our privacy policy',
      icon: '📄',
    },
    {
      id: 5,
      title: 'Terms of Service',
      subtitle: 'View terms and conditions',
      icon: '📋',
    },
    {
      id: 6,
      title: 'Clear Cache',
      subtitle: 'Free up storage space',
      icon: '🗑️',
    },
  ];

  const renderSettingItem = (item: any, isToggle: boolean = false) => (
    <View key={item.id} style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <BodyText size='lg'>{item.icon || '⚙️'}</BodyText>
        </View>
        <View style={styles.settingText}>
          <BodyText color={COLORS.primary} size='md' weight='medium'>
            {item.title}
          </BodyText>
          <BodyText color={COLORS.tertiary} size='sm'>
            {item.subtitle}
          </BodyText>
        </View>
      </View>

      {isToggle ? (
        <Switch
          value={item.enabled}
          onValueChange={() => handleSettingToggle(item.id)}
          trackColor={{ false: COLORS.border.light ,true: COLORS.primary + '50' }}
          thumbColor={item.enabled ? COLORS.primary : COLORS.tertiary}
        />
      ) : (
        <BodyText color={COLORS.tertiary} size='lg'>
          ›
        </BodyText>
      )}
    </View>
  );

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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <BodyText size='lg'>←</BodyText>
          </TouchableOpacity>
          <H1 color={COLORS.primary} weight='bold' size='2xl'>
            Settings
          </H1>
          <View style={styles.placeholder} />
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <H2
            color={COLORS.primary}
            weight='bold'
            size='lg'
            style={styles.sectionTitle}
          >
            Notifications
          </H2>
          <View style={styles.sectionContent}>
            {notificationSettings.map((item, index) => (
              <View key={item.id}>
                {renderSettingItem(item, true)}
                {index < notificationSettings.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <H2
            color={COLORS.primary}
            weight='bold'
            size='lg'
            style={styles.sectionTitle}
          >
            Security
          </H2>
          <View style={styles.sectionContent}>
            {securitySettings.map((item, index) => (
              <View key={item.id}>
                {renderSettingItem(item, true)}
                {index < securitySettings.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <H2
            color={COLORS.primary}
            weight='bold'
            size='lg'
            style={styles.sectionTitle}
          >
            App Settings
          </H2>
          <View style={styles.sectionContent}>
            {appSettings.map((item, index) => (
              <View key={item.id}>
                {renderSettingItem(item, true)}
                {index < appSettings.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Other Options Section */}
        <View style={styles.section}>
          <H2
            color={COLORS.primary}
            weight='bold'
            size='lg'
            style={styles.sectionTitle}
          >
            Other
          </H2>
          <View style={styles.sectionContent}>
            {otherOptions.map((item, index) => (
              <View key={item.id}>
                <TouchableOpacity style={styles.settingItem}>
                  {renderSettingItem(item, false)}
                </TouchableOpacity>
                {index < otherOptions.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <BodyText color={COLORS.tertiary} size='sm' style={styles.appVersion}>
            KDB Mobile App v1.0.0
          </BodyText>
          <BodyText color={COLORS.tertiary} size='sm'>
            Build 2024.01.15
          </BodyText>
        </View>

        {/* Reset Settings Button */}
        <TouchableOpacity style={styles.resetButton}>
          <ButtonTextSecondary size='md'>
            Reset to Default Settings
          </ButtonTextSecondary>
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
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border.light,
    marginLeft: 52,
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
  resetButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
});

export default SettingsScreen;
