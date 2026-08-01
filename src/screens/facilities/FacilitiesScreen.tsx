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
  mapPdfUrl?: string;
  markers?: {
    name: string;
    supervisor?: string;
    latitude: number;
    longitude: number;
  }[];
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
    mapPdfUrl:
      "https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2FparkingMap%2FAdobe%20Scan%20Oct%2024%2C%202025%20(3).pdf?alt=media&token=229478d8-6ec2-428f-a7b1-635f6bb6d565",
  },
  {
    id: "toilets",
    title: "Public Toilets",
    description:
      "Clean and regularly sanitized restrooms, including accessible washrooms.",
    icon: "water-outline",
    location: "Every 150m along the main stretch & near all entry gates",
    notes: "Maintenance staff on duty round the clock.",
    markers: [
      { name: "Pipli Flyover Ambala Side", supervisor: "KDB", latitude: 29.976466, longitude: 76.892684 },
      { name: "Pipli Flyover Karnal Side", supervisor: "KDB", latitude: 29.976174, longitude: 76.892739 },
      { name: "New Bus Stand", supervisor: "Transport Dept. (Maintained by KDB)", latitude: 29.973655, longitude: 76.865807 },
      { name: "Old Bus Stand", supervisor: "Transport Dept. (Maintained by KDB)", latitude: 29.97267, longitude: 76.837986 },
      { name: "Theme Park (Opp. Panorama)", supervisor: "KDB", latitude: 29.967045, longitude: 76.833299 },
      { name: "Theme Park (Opp. Anand Hospital)", supervisor: "KDB", latitude: 29.966713, longitude: 76.831452 },
      { name: "Bhadrkali Mandir", supervisor: "KDB", latitude: 29.978655, longitude: 76.831404 },
      { name: "Sthaneshwar Mandir", supervisor: "KDB", latitude: 29.980946, longitude: 76.827543 },
      { name: "Labour Chowk", supervisor: "KDB", latitude: 29.96354, longitude: 76.83537 },
      { name: "19 Manjil", supervisor: "KDB", latitude: 29.961014, longitude: 76.834814 },
      { name: "Near Amusement Site", supervisor: "KDB", latitude: 29.960036, longitude: 76.833863 },
      { name: "Mandi", supervisor: "KDB", latitude: 29.956747, longitude: 76.840733 },
      { name: "Near MAC", supervisor: "KDB", latitude: 29.957675, longitude: 76.832303 },
      { name: "Kirmach Gate", supervisor: "KDB", latitude: 29.958546, longitude: 76.826233 },
      { name: "Bajigar Dharmshala", supervisor: "KDB", latitude: 29.959105, longitude: 76.822445 },
      { name: "In front of KDB Office", supervisor: "KDB", latitude: 29.963996, longitude: 76.828738 },
      { name: "Jyotisar", supervisor: "KDB", latitude: 29.961076, longitude: 76.77188 },
      { name: "Narkatari", supervisor: "KDB", latitude: 29.967058, longitude: 76.799153 },
      { name: "Dyalpur", supervisor: "KDB", latitude: 29.938638, longitude: 76.814001 },
      { name: "Snahhit Sarover", supervisor: "KDB", latitude: 29.968039, longitude: 76.836514 },
      { name: "Near Dukhbhnjan Mandir", supervisor: "KDB", latitude: 29.965517, longitude: 76.836655 },
      { name: "Toilet No.1 Jai Ram Vidya Peeth North", supervisor: "KDB", latitude: 29.963202, longitude: 76.830958 },
      { name: "Toilet No.2 Near KDB Office", supervisor: "KDB", latitude: 29.963418, longitude: 76.829401 },
      { name: "Toilet No.4 Opp. Ror Dharmshala North", supervisor: "KDB", latitude: 29.964317, longitude: 76.824788 },
      { name: "Toilet No.5 Adjoining Yog Bhawan North", supervisor: "KDB", latitude: 29.96429, longitude: 76.82429 },
      { name: "Toilet No.6 West Side Adjoining PS", supervisor: "KDB", latitude: 29.963019, longitude: 76.821882 },
      { name: "Toilet No.7 West Side", supervisor: "KDB", latitude: 29.962664, longitude: 76.821817 },
      { name: "Toilet No.8 West Side", supervisor: "KDB", latitude: 29.96151, longitude: 76.821714 },
      { name: "Toilet No.9 West Side", supervisor: "KDB", latitude: 29.959552, longitude: 76.823508 },
      { name: "Toilet No.10 South Side University Side", supervisor: "KDB", latitude: 29.959405, longitude: 76.823846 },
      { name: "Toilet No.11 South Side University Side", supervisor: "KDB", latitude: 29.959184, longitude: 76.82517 },
      { name: "Toilet No.12 South Side University Side", supervisor: "KDB", latitude: 29.959129, longitude: 76.825586 },
      { name: "Toilet No.13 South Side University Side", supervisor: "KDB", latitude: 29.959034, longitude: 76.825625 },
      { name: "Toilet No.14 South Side MAC Side", supervisor: "KDB", latitude: 29.958685, longitude: 76.828384 },
      { name: "Toilet No.15 South Side MAC Side", supervisor: "KDB", latitude: 29.958636, longitude: 76.828797 },
      { name: "Toilet No.16 South Side MAC Side", supervisor: "KDB", latitude: 29.95844, longitude: 76.830103 },
      { name: "Toilet No.17 South Side MAC Side", supervisor: "KDB", latitude: 29.958345, longitude: 76.830462 },
      { name: "Toilet No.18 New East Side", supervisor: "KDB", latitude: 29.959554, longitude: 76.832996 },
      { name: "Toilet No.21 New East Side", supervisor: "KDB", latitude: 29.961362, longitude: 76.833298 },
      { name: "Purshotam Pura Bagh", supervisor: "KDB", latitude: 29.960918, longitude: 76.826342 },
    ],
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
      if (facility.mapPdfUrl || facility.markers) {
        navigation.navigate("FacilityMap", {
          title: facility.title,
          pdfUrl: facility.mapPdfUrl,
          markers: facility.markers,
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

              {(facility.mapPdfUrl || facility.markers) && (
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
                      View Map
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

