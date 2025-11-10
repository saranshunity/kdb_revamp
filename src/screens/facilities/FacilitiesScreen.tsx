import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../constants/colors";
import { FONTS, FONT_SIZES } from "../../constants/fonts";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";

type FacilitiesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Facilities"
>;

type Facility = {
  id: string;
  title: string;
  description: string;
  icon: string;
  location: string;
  timings?: string;
  notes?: string;
  mapRoute?: {
    lat: number;
    lng: number;
    label: string;
  };
};

const FACILITIES: Facility[] = [
  {
    id: "medical-wheelchair",
    title: "Medical & Wheelchair Assistance",
    description:
      "On-site medical support along with wheelchair assistance for the elderly and differently abled.",
    icon: "medkit-outline",
    location: "Bays No. 2 & 3, Near Main Gate, Brahma Sarovar",
    notes: "3 wheelchairs currently stationed. Volunteers available 24x7.",
  },
  {
    id: "food-courts",
    title: "Food Courts & Refreshments",
    description:
      "Six curated food courts serving regional specialties, sattvic meals, and quick bites throughout the day.",
    icon: "restaurant-outline",
    location:
      "Food Court 1: Bays 99-104 (Northern side, Eastern half)\n" +
      "Food Court 2: Bays 203-208 (Eastern side)\n" +
      "Food Court 3: Bays 249-254 (Eastern side)\n" +
      "Food Court 4: Bays 350-355 (Southern side, Eastern half)\n" +
      "Food Court 5: Bays 819-824 (Northern side, Western half)\n" +
      "Food Court 6: Bays 476-481 (Southern side, Western half)",
  },
  {
    id: "parking",
    title: "Parking Assistance",
    description:
      "Guided parking zones with attendants to help you find a safe spot quickly.",
    icon: "car-outline",
    location:
      "Northern side of Eastern half of Brahma Sarovar\n" +
      "In front of KDB Office (light vehicles only)\n" +
      "Near Brahma Sarovar Main Gate (Dakshin Mukhi Hanuman Mandir) – all vehicles\n" +
      "Back side of Dakshin Mukhi Hanuman Mandir – all vehicles\n" +
      "Opposite Ror Dharamshala – all vehicles\n" +
      "In front of War Formation, Brahma Sarovar – all vehicles\n" +
      "Western side of Brahma Sarovar – all vehicles\n" +
      "Near Bazigar Dharamshala, in front of VIP Ghat – all vehicles (concessional)\n" +
      "Near Old VIP Ghat – all vehicles (concessional)\n" +
      "Eastern side Brahma Sarovar Pakki Parking – all vehicles\n" +
      "In front of Astadash Vibhuti Temple – all vehicles\n" +
      "Near Punjabi Dharamshala Corner – all vehicles\n" +
      "Sannehit Sarovar area (multiple zones incl. Foji Colony, Eastern side, Nirmal Akhara)\n" +
      "In front of Shri Krishna Museum – all vehicles\n" +
      "In front of Balmiki Ashram – all vehicles\n" +
      "Designated mela/fair grounds on KDB land",
    timings: "Open 24x7 during Mahotsav",
    mapRoute: {
      lat: 29.9655,
      lng: 76.8279,
      label: "Mahotsav Parking Hub",
    },
  },
  {
    id: "toilets",
    title: "Public Toilets",
    description:
      "Clean and regularly sanitized restrooms, including accessible washrooms.",
    icon: "water-outline",
    location: "Every 150m along the main stretch & near all entry gates",
    notes: "Maintenance staff on duty round the clock.",
  },
  {
    id: "drinking-water",
    title: "Drinking Water Points",
    description:
      "Filtered drinking water kiosks to keep you hydrated throughout the festivities.",
    icon: "water-outline",
    location:
      "Inside Brahma Sarovar: Bays 6, 60, 94, 109, 202, 255, 345, 356, 391, 402, 471, 486, 521, 532, 630, 751, 783, 825, 829\n" +
      "Purushottampura Bagh: Near Main Stage, Katyani Temple, Khatu Shyam Temple\n" +
      "Eastern side (outside toilets): 2 kiosks · Southern eastern half: 2 kiosks · Southern western half: 1 kiosk\n" +
      "Additional points: In front of Ror Dharamshala, Dakshini Hanuman Temple, KDB Office, and Jairam Vidyapeeth",
  },
  {
    id: "lost-found",
    title: "Lost & Found Helpdesk",
    description:
      "Report or collect lost belongings, and seek assistance for missing persons.",
    icon: "help-circle-outline",
    location: "Bays No. 1, Near Main Gate, Brahma Sarovar",
    timings: "8:00 AM - 10:00 PM",
    notes: "Dedicated volunteers stationed at the Information Desk. Dial 102 from onsite helplines for urgent assistance.",
  },
];

const FacilitiesScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<FacilitiesScreenNavigationProp>();
  const [expandedFacilities, setExpandedFacilities] = useState<string[]>([]);

  const toggleFacility = useCallback((id: string) => {
    setExpandedFacilities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleViewMap = useCallback(
    (facility: Facility) => {
      if (facility.mapRoute) {
        navigation.navigate("FacilityMap", {
          latitude: facility.mapRoute.lat,
          longitude: facility.mapRoute.lng,
          title: facility.mapRoute.label,
        });
      } else {
        Alert.alert(
          "Map view coming soon",
          `We'll highlight "${facility.title}" on the Mahotsav grounds map shortly.`
        );
      }
    },
    [navigation]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background.primary}
      />

      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Facilities & Services</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* <View style={styles.heroCard}>
          <Ionicons name="sparkles-outline" size={28} color={COLORS.white} />
          <View style={styles.heroTextWrapper}>
            <Text style={styles.heroTitle}>Your Comfort, Our Priority</Text>
            <Text style={styles.heroSubtitle}>
              Explore essential amenities across the Mahotsav grounds.
            </Text>
          </View>
        </View> */}

        {FACILITIES.map((facility, facilityIndex) => {
          const locationLines = facility.location.split("\n");
          const isExpandable = locationLines.length > 2;
          const isExpanded = expandedFacilities.includes(facility.id);
          const visibleLines = isExpandable
            ? isExpanded
              ? locationLines
              : locationLines.slice(0, 2)
            : locationLines;

          return (
            <View key={facility.id} style={styles.facilityCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconWrapper}>
                  <Ionicons
                    name={facility.icon}
                    size={22}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.facilityTitle}>{facility.title}</Text>
              </View>

              <Text style={styles.facilityDescription}>
                {facility.description}
              </Text>

              <View style={styles.detailRow}>
                <View style={styles.detailTextWrapper}>
                  {visibleLines.map((line, index) => (
                    <View
                      key={`${facility.id}-loc-${index}`}
                      style={styles.detailLine}
                    >
                      <Text style={styles.detailBullet}>
                        {`${facilityIndex + 1}.${index + 1}`}
                      </Text>
                      <Text style={styles.detailText}>{line}</Text>
                    </View>
                  ))}
                  {isExpandable && !isExpanded && (
                    <Text style={styles.detailEllipsis}>…</Text>
                  )}
                </View>
              </View>

              {isExpandable && (
                <TouchableOpacity
                  style={styles.expandRow}
                  onPress={() => toggleFacility(facility.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.expandText}>
                    {isExpanded ? "Hide details" : "Show all locations"}
                  </Text>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              )}

              {facility.timings ? (
                <View style={styles.detailRowIcon}>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                  <Text style={styles.detailTextIcon}>{facility.timings}</Text>
                </View>
              ) : null}

              {facility.notes ? (
                <View style={styles.notesPill}>
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color={COLORS.primary}
                  />
                  <Text style={styles.notesText}>{facility.notes}</Text>
                </View>
              ) : null}

              {facility.mapRoute && (
                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={[styles.mapButton, styles.mapButtonSecondary]}
                    activeOpacity={0.85}
                    onPress={() => handleViewMap(facility)}
                  >
                    <Ionicons
                      name="map-outline"
                      size={18}
                      color={COLORS.primary}
                    />
                    <Text style={[styles.mapButtonText, styles.mapButtonTextPrimary]}>
                      View Parking Map
                    </Text>
                  </TouchableOpacity>
                </View>
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
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background.appColor,
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  heroTextWrapper: {
    marginLeft: 16,
    flex: 1,
  },
  heroTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.white,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.white,
  },
  facilityCard: {
    backgroundColor: COLORS.background.primary,
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background.tertiary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  facilityTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.primary,
    flex: 1,
  },
  facilityDescription: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailRowIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  detailBullet: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.primary,
    marginTop: 2,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  detailTextIcon: {
    marginLeft: 8,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.primary,
  },
  detailTextWrapper: {
    flex: 1,
    gap: 6,
  },
  detailEllipsis: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.secondary,
    alignSelf: "flex-start",
  },
  expandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.background.tertiary,
    marginBottom: 12,
    marginLeft: 44,
  },
  expandText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.primary,
    textTransform: "uppercase",
  },
  notesPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background.tertiary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
    gap: 6,
  },
  notesText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.secondary,
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  mapButtonSecondary: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  mapButtonText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.white,
  },
  mapButtonTextPrimary: {
    color: COLORS.primary,
  },
});

export default FacilitiesScreen;

