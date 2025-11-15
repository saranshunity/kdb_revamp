import React, { useCallback, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { COLORS } from "../../constants/colors";
import { FONTS, FONT_SIZES } from "../../constants/fonts";
import {
  GITA_MAHOTSAV_COLORS,
  GitaMahotsavColorInfo,
} from "./constants/gitaMahotsavColors";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "GitaMahotsavColors"
>;

const GitaMahotsavColorsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }, []);

  const renderCard = useCallback(
    (item: GitaMahotsavColorInfo, index: number) => {
      const isExpanded = expandedIds.includes(item.id);
      return (
        <View key={item.id} style={styles.card}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => toggleExpanded(item.id)}
          >
            <ImageBackground
              source={{ uri: item.image }}
              style={styles.cardImage}
              imageStyle={styles.cardImageBorder}
            >
              <View style={[styles.colorOverlay]} />
              <View style={styles.cardNumberBadge}>
                <Text style={styles.cardNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.cardTitleOverlay}>
                <Text style={styles.cardTitle}>{item.label}</Text>
              </View>
            </ImageBackground>
            <View style={styles.cardContent}>
              <View style={styles.cardTextWrapper}>
                <Text style={styles.cardSubtitle} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              {/* <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={22}
                color={COLORS.primary}
              /> */}
            </View>
          </TouchableOpacity>
          {/* {isExpanded && (
            <View style={styles.expandedSection}>
              <Text style={styles.expandedHeading}>Event Highlights</Text>
              {item.events.map((event) => (
                <View key={event.title} style={styles.eventRow}>
                  <View style={styles.eventIconWrapper}>
                    <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                  </View>
                  <View style={styles.eventTextWrapper}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventMeta}>
                      {event.time} · {event.venue}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )} */}
        </View>
      );
    },
    [expandedIds, toggleExpanded]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>18 Colors of Gita Mahotsav</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {GITA_MAHOTSAV_COLORS.map((item, index) => renderCard(item, index))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    backgroundColor: COLORS.background.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    // flex: 1,
    textAlign: "center",
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.primary,
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: COLORS.background.primary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    overflow: "hidden",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardImage: {
    height: 180,
    justifyContent: "flex-end",
  },
  cardImageBorder: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  colorOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  cardNumberBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: COLORS.background.primary,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cardNumberText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.primary,
  },
  cardTitleOverlay: {
    backgroundColor: `${COLORS.black}90`,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.white,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardTextWrapper: {
    flex: 1,
    marginRight: 12,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.secondary,
  },
  expandedSection: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  expandedHeading: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.primary,
    marginBottom: 12,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  eventIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background.tertiary,
    marginRight: 10,
  },
  eventTextWrapper: {
    flex: 1,
  },
  eventTitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  eventMeta: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.secondary,
  },
});

export default GitaMahotsavColorsScreen;

