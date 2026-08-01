import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { COLORS } from "../../constants/colors";
import { FONTS, FONT_SIZES } from "../../constants/fonts";

type IconicPlacesNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "IconicPlaces"
>;

type IconicPlace = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  highlights: string[];
  linkLabel?: string;
  linkUrl?: string;
  imageUrl: string;
};

const ICONIC_PLACES: IconicPlace[] = [
  {
    id: "brahma-sarovar",
    title: "About Brahma Sarovar",
    subtitle: "The sacred reservoir of Kurukshetra",
    icon: "water-outline",
    description:
      "Brahma Sarovar, the sacred water reservoir situated in the holy city of Kurukshetra, holds immense spiritual, historical, and cultural significance. It is believed that Lord Brahma, the Creator of the Universe, performed the first Yajna (sacrificial ritual) here, marking the origin of creation itself. The serene and divine atmosphere of Brahma Sarovar attracts pilgrims and visitors from all over the world, especially during solar eclipses and religious festivals, when taking a holy dip in its waters is considered highly auspicious. The site also becomes a focal point during the celebration of International Gita Mahotsav, when thousands of devotees gather to pay homage to the timeless teachings of the Bhagavad Gita. The beautifully illuminated ghats, evening aarti, and cultural performances add to the grandeur of the occasion. Over the years, Brahma Sarovar has also evolved as a center for social and cultural activities, symbolizing purity, peace, and the eternal spiritual heritage of India.",
    highlights: [
      "Witness the sunrise aarti, illuminated ghats, and evening deepotsav.",
      "Take a holy dip during eclipses or festivals for an auspicious blessing.",
      "Join devotees during International Gita Mahotsav for cultural performances.",
    ],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2Fbrahamsarovar.jpg?alt=media&token=ca8b89bc-eaa8-451c-b5f1-44fdd8ac6441",
  },
  {
    id: "jyotisar",
    title: "The Jyotisar Sermon",
    subtitle: "Where the Bhagavad Gita was spoken",
    icon: "book-outline",
    description:
      "The Jyotisar sermon commemorates the divine discourse delivered by Lord Krishna to Arjuna on the eve of the Mahabharata war. At this sacred moment the Bhagavad Gita—one of Hinduism’s most revered scriptures—was first revealed, guiding Arjuna from despair to steadfast resolve.",
    highlights: [
      "Location: Jyotisar, near Kurukshetra, Haryana—revered as the precise spot where the teachings of the Gita were imparted.",
      "Context: Arjuna, conflicted about fighting his kin, confided in Krishna, who responded with timeless wisdom.",
      "Core message: Embrace one’s dharma (duty) without attachment to outcomes, acting with courage and devotion.",
      "Sacred features: Ancient banyan tree believed to witness the sermon, and a marble chariot depicting Krishna counseling Arjuna.",
      "Pilgrimage: Devotees visit year-round; the site hosts light-and-sound narrations and remains a symbol of spiritual enlightenment.",
    ],
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2FjyotisarSermon.jpeg?alt=media&token=7915c869-1be0-4d11-a288-3e477d9814f5",
  },
  {
    id: "shri-krishna-museum",
    title: "Shri Krishna Museum",
    subtitle: "Treasury of Krishna lore and legacy",
    icon: "podium-outline",
    description:
      "Krishna has been the most popular character in Indian myths and legends. His versatile personality made him a deity, and his divinity as well as humanity stand unparalleled in the history of human civilization. Ever since the character of Krishna was deified as a god, he has remained a subject of deep adoration. A source of perennial inspiration for art and literature, Krishna embodies both intellectual and spiritual glory. Each attempt to unfold the mystery of Krishna becomes an enchanting experience, for whenever one untwines his fabric, a new dimension is discovered within.",
    highlights: [
      "Timings: 10:00 AM to 5:00 PM",
      "Closed on: Mondays",
    ],
    linkLabel: "Know more about Shri Krishna Museum",
    linkUrl: "https://srikrishnamuseum.com/",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2Fsri-krishna-museum-1.jpg?alt=media&token=14bced65-be8b-4b5c-a71c-f6d3d426dcab",
  },
];

const IconicPlacesScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<IconicPlacesNavigationProp>();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = useCallback(
    (id: string) => {
      setExpandedId((prev) => (prev === id ? null : id));
    },
    []
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
        <Text style={styles.headerTitle}>Iconic Places</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {ICONIC_PLACES.map((place) => {
          const isExpanded = expandedId === place.id;
          return (
            <View key={place.id} style={styles.card}>
              <TouchableOpacity
                style={styles.cardHeader}
                activeOpacity={0.8}
                onPress={() => handleToggle(place.id)}
              >
                <View style={styles.iconWrapper}>
                  <Ionicons name={place.icon} size={22} color={COLORS.primary} />
                </View>
                <View style={styles.headerTextWrapper}>
                  <Text style={styles.cardTitle}>{place.title}</Text>
                  <Text style={styles.cardSubtitle}>{place.subtitle}</Text>
                </View>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={COLORS.primary}
                />
              </TouchableOpacity>

              {isExpanded && (
                <>
                  <Image source={{ uri: place.imageUrl }} style={styles.heroImage} />
                  <Text style={styles.cardDescription}>{place.description}</Text>
                  <View style={styles.highlightsWrapper}>
                    <Text style={styles.highlightsHeading}>Highlights</Text>
                    {place.highlights.map((highlight, idx) => (
                      <View
                        key={`${place.id}-highlight-${idx}`}
                        style={styles.highlightRow}
                      >
                        <View style={styles.bullet} />
                        <Text style={styles.highlightText}>{highlight}</Text>
                      </View>
                    ))}
                    {place.linkLabel && place.linkUrl && (
                      <TouchableOpacity
                        style={styles.linkButton}
                        activeOpacity={0.85}
                        onPress={() => Linking.openURL(place.linkUrl!)}
                      >
                        <Ionicons
                          name="open-outline"
                          size={18}
                          color={COLORS.primary}
                        />
                        <Text style={styles.linkButtonText}>{place.linkLabel}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>
          );
        })}

        <View style={{ height: 32 }} />
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
    flex: 1,
    textAlign: "center",
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.primary,
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  card: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 4,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.background.tertiary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTextWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.primary,
  },
  cardSubtitle: {
    marginTop: 2,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.secondary,
  },
  cardDescription: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.primary,
    lineHeight: 20,
    marginTop: 12,
  },
  heroImage: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    marginTop: 8,
  },
  highlightsWrapper: {
    marginTop: 12,
  },
  highlightsHeading: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  highlightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  highlightText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: COLORS.background.appColor,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  linkButtonText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.primary,
  },
});

export default IconicPlacesScreen;

