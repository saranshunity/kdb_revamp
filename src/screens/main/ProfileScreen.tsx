import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { H1, H2, BodyText, H3 } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const handleApply = () => {
    navigation.navigate('TirthMitraIntro');
  };

  const handleCheckStatus = () => {
    navigation.navigate('TirthMitraStatus', {});
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <H3 style={styles.headerTitle} color={COLORS.text.primary} weight="semiBold" size="md">
            Tirth Mitra Card
          </H3>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.contentContainer}>
    

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {/* Apply Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Ionicons name="document-text" size={24} color={COLORS.white} />
              <View style={styles.buttonTextContainer}>
                <BodyText
                  style={styles.actionButtonText}
                  color={COLORS.white}
                  size="lg"
                  weight="bold"
                >
                  Apply for Card
                </BodyText>
                <BodyText
                  style={styles.actionButtonSubtext}
                  color={COLORS.white}
                  size="sm"
                >
                  New Application
                </BodyText>
              </View>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </TouchableOpacity>

            {/* Check Status Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleCheckStatus}
              activeOpacity={0.8}
            >
              <Ionicons name="search" size={24} color={COLORS.background.appColor} />
              <View style={styles.buttonTextContainer}>
                <BodyText
                  style={styles.secondaryButtonText}
                  color={COLORS.background.appColor}
                  size="lg"
                  weight="bold"
                >
                  Check Status
                </BodyText>
                <BodyText
                  style={styles.secondaryButtonSubtext}
                  color={COLORS.text.secondary}
                  size="sm"
                >
                  Track your application
                </BodyText>
              </View>
              <Ionicons name="arrow-forward" size={20} color={COLORS.background.appColor} />
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background.appColor + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.xl,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: 40,
  },
  actionButtonsContainer: {
    width: '100%',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: COLORS.background.appColor,
  },
  secondaryButton: {
    backgroundColor: COLORS.background.secondary,
    borderWidth: 2,
    borderColor: COLORS.background.appColor,
  },
  buttonTextContainer: {
    flex: 1,
    gap: 4,
  },
  actionButtonText: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
  },
  actionButtonSubtext: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
    opacity: 0.9,
  },
  secondaryButtonText: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
  },
  secondaryButtonSubtext: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ProfileScreen;
