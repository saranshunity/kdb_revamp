import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { H2, BodyText, ButtonTextPrimary } from './Text';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface UpdateBottomSheetProps {
  visible: boolean;
  forceUpdate: boolean;
  title: string;
  message: string;
  onUpdatePress: () => void;
  onDismiss?: () => void;
}

const UpdateBottomSheet: React.FC<UpdateBottomSheetProps> = ({
  visible,
  forceUpdate,
  title,
  message,
  onUpdatePress,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [visible, slideAnim]);

  // Handle back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible && forceUpdate) {
        return true; // Prevent back press if update is forced
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, forceUpdate]);

  const handleDismiss = () => {
    if (!forceUpdate && onDismiss) {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        onDismiss();
      });
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={forceUpdate ? undefined : handleDismiss}
    >
      <View style={styles.overlayContainer}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={forceUpdate ? undefined : handleDismiss}
        />
        <TouchableOpacity activeOpacity={1} onPress={undefined}>
          <Animated.View
            style={[
              styles.bottomSheet,
              { 
                paddingBottom: insets.bottom + 20,
                maxHeight: '100%',
              },
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Handle */}
            <View style={styles.handle} />

            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="cloud-download" size={48} color={COLORS.appColor} />
            </View>

            {/* Title */}
            <H2 color={COLORS.text.primary} weight="bold" size="xl" style={styles.title}>
              {title}
            </H2>

            {/* Message */}
            <BodyText color={COLORS.text.secondary} size="md" style={styles.message}>
              {message}
            </BodyText>

            {/* Update Button */}
            <TouchableOpacity
              style={styles.updateButton}
              onPress={onUpdatePress}
              activeOpacity={0.8}
            >
              <ButtonTextPrimary size="md">Update Now</ButtonTextPrimary>
            </TouchableOpacity>

            {/* Optional Dismiss for non-force updates */}
            {!forceUpdate && (
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={handleDismiss}
                activeOpacity={0.7}
              >
                <BodyText color={COLORS.text.tertiary} size="sm">
                  Later
                </BodyText>
              </TouchableOpacity>
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: COLORS.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border.light,
    borderRadius: 2,
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.appColor + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  updateButton: {
    backgroundColor: COLORS.appColor,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  dismissButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
});

export default UpdateBottomSheet;
