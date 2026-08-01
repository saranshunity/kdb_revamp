import React from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { COLORS } from "../../constants/colors";
import { FONTS, FONT_SIZES } from "../../constants/fonts";

type MuseumShowsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MuseumShows"
>;

type Exhibit = {
  id: string;
  title: string;
  timing: string;
  closed: string;
  location: string;
  tickets: string[];
  icon: string;
  badge?: string;
};

const EXHIBITS: Exhibit[] = [
  {
    id: "panorama",
    title: "Panorama Museum",
    timing: "10:00 AM to 6:00 PM",
    closed: "Closed on Holi & Deepawali",
    location: "Kurukshetra Panorama & Science Centre, Kurukshetra",
    icon: "aperture-outline",
    tickets: [
      "Per person: ₹50",
      "Group (25+ visitors): ₹40 per person",
      "Student group (Private school): ₹10 per student",
      "Student group (Government school): ₹5 per student",
      "Children (3-4 ft height): Free",
      "Defense/Paramilitary in uniform with ID: Free",
      "Persons with Disabilities: Free",
    ],
  },
  {
    id: "museum",
    title: "Shri Krishna Museum",
    timing: "10:00 AM to 5:00 PM",
    closed: "Closed on Mondays",
    location: "Shri Krishna Museum, Kurukshetra",
    icon: "podium-outline",
    tickets: [
      "Age above 10 years: ₹30",
      "Age 5 to 10 years: ₹10",
      "Concessional tickets (students): ₹10",
      "Age 0 to 5 years: Free",
    ],
  },
  {
    id: "lightsound",
    title: "Light & Sound Show (Jyotisar)",
    timing: "At sunset",
    closed: "Closed on National Holidays",
    location: "Jyotisar Tirth, Kurukshetra",
    icon: "sparkles-outline",
    badge: "Evening Highlight",
    tickets: [
      "Per person: ₹30",
      "Students (Class 5-12 with school ID): ₹20",
      "Students (up to Class 5 with school ID): ₹10",
      "Defense/Paramilitary in uniform with ID: ₹10",
      "Persons with Disabilities: ₹10",
    ],
  },
];

const MuseumShowsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MuseumShowsNavigationProp>();

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
        <Text style={styles.headerTitle}>Museums & Shows</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {EXHIBITS.map((exhibit) => (
          <View key={exhibit.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrapper}>
                <Ionicons name={exhibit.icon} size={22} color={COLORS.primary} />
              </View>
              <View style={styles.headerTextWrapper}>
                <Text style={styles.cardTitle}>{exhibit.title}</Text>
                <Text style={styles.cardTiming}>{exhibit.timing}</Text>
              </View>
            
            </View>

            <View style={styles.cardRow}>
              <Ionicons name="location-outline" size={18} color={COLORS.primary} />
              <Text style={styles.cardMeta}>{exhibit.location}</Text>
            </View>

            <View style={styles.cardRow}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
              <Text style={styles.cardMeta}>{exhibit.closed}</Text>
            </View>

            <View style={styles.ticketSection}>
              <Text style={styles.ticketHeading}>Tickets</Text>
              {exhibit.tickets.map((ticket, index) => (
                <View key={`${exhibit.id}-ticket-${index}`} style={styles.ticketRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.ticketText}>{ticket}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

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
  cardTiming: {
    marginTop: 2,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.secondary,
  },
  badge: {
    backgroundColor: COLORS.background.appColor,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.white,
    textTransform: "uppercase",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardMeta: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  ticketSection: {
    marginTop: 6,
  },
  ticketHeading: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  ticketRow: {
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
  ticketText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});

export default MuseumShowsScreen;

