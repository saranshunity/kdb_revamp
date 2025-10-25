import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H1, H2, H3, BodyText, ButtonTextPrimary } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';

type StallsMainScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Stalls'>;

const StallsMainScreen = () => {
  const navigation = useNavigation<StallsMainScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const handleApplyForShops = () => {
    navigation.navigate('StallCategories');
  };

  const handleCheckStatus = () => {
    navigation.navigate('CheckApplicationStatus');
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
        <H1 color={COLORS.text.primary} weight='bold' size='lg'>
          Stalls & Shops
        </H1>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          {/* <View style={styles.iconContainer}>
            <Ionicons name="storefront-outline" size={48} color={COLORS.primary} />
          </View> */}
          {/* <H2 color={COLORS.text.primary} weight='semiBold' size='xl' style={styles.welcomeTitle}>
            Welcome to Stalls & Shops
          </H2> */}
          {/* <BodyText color={COLORS.text.secondary} size='md' style={styles.welcomeDescription}>
            Apply for your stall at International Gita Mahotsav 2025 or check the status of your existing application.
          </BodyText> */}
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {/* Apply for Shops Option */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleApplyForShops}
            activeOpacity={0.8}
          >
            <View style={styles.optionContent}>
              <View style={[styles.optionIcon, { backgroundColor: COLORS.primary + '20' }]}>
                <Ionicons name="add-circle-outline" size={32} color={COLORS.primary} />
              </View>
              <View style={styles.optionText}>
                <H3 color={COLORS.text.primary} weight='semiBold' size='lg'>
                  Apply for Shops
                </H3>
                <BodyText color={COLORS.text.secondary} size='sm' style={styles.optionDescription}>
                  Submit a new application for stall allocation at the Mahotsav
                </BodyText>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.text.tertiary} />
            </View>
          </TouchableOpacity>

          {/* Check Status Option */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleCheckStatus}
            activeOpacity={0.8}
          >
            <View style={styles.optionContent}>
              <View style={[styles.optionIcon, { backgroundColor: COLORS.secondary + '20' }]}>
                <Ionicons name="search-outline" size={32} color={COLORS.secondary} />
              </View>
              <View style={styles.optionText}>
                <H3 color={COLORS.text.primary} weight='semiBold' size='lg'>
                  Check Status
                </H3>
                <BodyText color={COLORS.text.secondary} size='sm' style={styles.optionDescription}>
                  Track your existing application using phone number or application ID
                </BodyText>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.text.tertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
            <BodyText color={COLORS.text.tertiary} size='xs' style={styles.infoText}>
              Applications are reviewed on a first-come, first-served basis. You will be notified via SMS/Email once your application is processed.
            </BodyText>
          </View>
        </View>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.tertiary,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 0,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeDescription: {
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    marginTop: 20,
  },
  optionCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.background.tertiary,
    shadowColor: COLORS.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionDescription: {
    marginTop: 4,
    lineHeight: 18,
  },
  infoSection: {
    marginTop: 40,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.background.tertiary,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    lineHeight: 16,
  },
});

export default StallsMainScreen;
