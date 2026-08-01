import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FONTS, FONT_SIZES } from "../constants/fonts";
import { COLORS } from "../constants/colors";

type QuickLinkItemProps = {
  icon: string;      // Ionicons name
  label: string;     // e.g. "Foods"
  onPress?: () => void;
  badgeText?: string;
};

const QuickLinkItem: React.FC<QuickLinkItemProps> = ({ icon, label, onPress, badgeText }) => {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
      {badgeText ? (
        <View style={styles.badgeWrapper}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      ) : null}
      {/* Yellow circle background */}
      <View style={styles.iconWrapper}>
        <View style={styles.circle} />
        <Ionicons name={icon} size={24} color={COLORS.text.primary} style={styles.icon} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

export default QuickLinkItem;

const styles = StyleSheet.create({
  container: {
    width: 70,
    height: 90,
    borderRadius: 10,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    position: 'relative',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  circle: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.appColor,
    right: 0,
    bottom: 0,
  },
  icon: {
    zIndex: 1,
  },
  label: {
    marginTop: 10,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  badgeWrapper: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.background.appColor,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  badgeText: {
    fontSize: 8,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.white,
    textTransform: 'uppercase',
  },
});
