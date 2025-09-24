import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FONTS, FONT_SIZES } from "../constants/fonts";
import { COLORS } from "../constants/colors";

type QuickLinkItemProps = {
  icon: string;      // Ionicons name
  label: string;     // e.g. "Foods"
  onPress?: () => void;
};

const QuickLinkItem: React.FC<QuickLinkItemProps> = ({ icon, label, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
      {/* Yellow circle background */}
      <View style={styles.iconWrapper}>
        <View style={styles.circle} />
        <Ionicons name={icon} size={36} color={COLORS.text.primary} style={styles.icon} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

export default QuickLinkItem;

const styles = StyleSheet.create({
  container: {
    width: 90,
    height: 110,
    borderRadius: 20,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  iconWrapper: {
    width: 60,
    height: 60,
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
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.primary,
  },
});
