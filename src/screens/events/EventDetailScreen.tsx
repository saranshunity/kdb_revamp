import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from "react-native-vector-icons/Ionicons";
import EventCard from "./components/EventCard"; // reuse previous EventCard

type EventDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EventDetail'>;

const EventDetailScreen = () => {
  const [isFavorite, setFavorite] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<EventDetailScreenNavigationProp>();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View>
          <Image
            source={{ uri: "https://picsum.photos/500/300" }}
            style={styles.coverImage}
          />

          {/* Back button */}
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color="#000" />
          </TouchableOpacity>

          {/* Favorite */}
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={() => setFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? "#FF4C4C" : "#333"}
            />
          </TouchableOpacity>
        </View>

        {/* Event Info */}
        <View style={styles.content}>
          <Text style={styles.type}>Music Event</Text>
          <Text style={styles.title}>Premium Staycation Package at Pan Pacific</Text>

          {/* Organizer */}
          {/* <View style={styles.organizerRow}>
            <Image
              source={{ uri: "https://picsum.photos/40" }}
              style={styles.orgLogo}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.orgName}>British Council Vietnam</Text>
              <Text style={styles.orgType}>Organizational</Text>
            </View>
            <TouchableOpacity style={styles.followBtn}>
              <Text style={styles.followText}>Follow</Text>
            </TouchableOpacity>
          </View> */}

          {/* Date & Time */}
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={18} color="#444" />
            <View style={styles.rowText}>
              <Text style={styles.date}>Sun, Mar 22, 2020</Text>
              <Text style={styles.time}>8:30 PM – 10:00 PM</Text>
            </View>
          </View>

          {/* Reminder */}
          <TouchableOpacity style={styles.row}>
            <Ionicons name="notifications-outline" size={18} color="#444" />
            <Text style={[styles.rowTextSingle, { color: "#007AFF" }]}>
              Reminder
            </Text>
          </TouchableOpacity>

          {/* Location */}
          <View style={styles.row}>
            <Ionicons name="location-outline" size={18} color="#444" />
            <View style={styles.rowText}>
              <Text style={styles.date}>Manzi Art Space and Cafe</Text>
              <Text style={styles.time}>14 Phan Huy Ich, Ba Dinh, Hanoi</Text>
            </View>
            <Text style={[styles.link]}>Directions</Text>
          </View>

          {/* About */}
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.about} numberOfLines={expanded ? undefined : 3}>
            A nice quaint cafe with a good view of the lower city and mountains.
            Good to visit even when cloudy or raining because they have a
            friendly pupper to keep guests company as you.
          </Text>
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text style={styles.readMore}>
              {expanded ? "Read less" : "Read more"}
            </Text>
          </TouchableOpacity>

          {/* Map Placeholder */}
          <Text style={styles.sectionTitle}>Location</Text>
          <Image
            source={{ uri: "https://picsum.photos/400/200" }}
            style={styles.map}
          />

          {/* Events You May Like */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Events May You Like</Text>
            <TouchableOpacity>
              <Text style={styles.link}>Show all →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <EventCard
              image="https://picsum.photos/400/250"
              title="The Romanian – Solo Exhibition"
              time="Today at 8:30 PM"
              location="Vicas Art Studio"
            />
            <EventCard
              image="https://picsum.photos/401/250"
              title="Femme-Broidery Workshop"
              time="Tomorrow at 10:00 AM"
              location="Hockett Haus of Crafts"
            />
          </ScrollView>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      {/* <View style={styles.footer}>
        <Text style={styles.price}>From <Text style={styles.priceValue}>$25 – $60</Text></Text>
        <TouchableOpacity style={styles.buyBtn}>
          <Text style={styles.buyText}>Buy Ticket</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

export default EventDetailScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background.primary 
  },
  coverImage: { width: "100%", height: 240 },
  backBtn: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
  },
  favoriteBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
  },
  content: { padding: 16 },
  type: { 
    color: COLORS.text.secondary, 
    fontSize: FONT_SIZES.xs, 
    fontFamily: FONTS.gilroy.regular,
    marginBottom: 4 
  },
  title: { 
    fontSize: FONT_SIZES.xl, 
    fontFamily: FONTS.gilroy.bold, 
    color: COLORS.text.primary,
    marginBottom: 16 
  },
  organizerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  orgLogo: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  orgName: { 
    fontFamily: FONTS.gilroy.semiBold, 
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary
  },
  orgType: { 
    fontSize: FONT_SIZES.xs, 
    color: COLORS.text.tertiary,
    fontFamily: FONTS.gilroy.regular
  },
  followBtn: {
    backgroundColor: COLORS.background.appColor,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  followText: { 
    color: COLORS.white, 
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.xs
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  rowText: { marginLeft: 10, flex: 1 },
  rowTextSingle: { 
    marginLeft: 10, 
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.primary
  },
  date: { 
    fontFamily: FONTS.gilroy.semiBold, 
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary
  },
  time: { 
    fontSize: FONT_SIZES.xs, 
    color: COLORS.text.secondary,
    fontFamily: FONTS.gilroy.regular
  },
  link: { 
    color: COLORS.background.appColor, 
    fontSize: FONT_SIZES.xs, 
    fontFamily: FONTS.gilroy.semiBold
  },
  sectionTitle: { 
    fontSize: FONT_SIZES.md, 
    fontFamily: FONTS.gilroy.bold, 
    color: COLORS.text.primary,
    marginVertical: 12 
  },
  about: { 
    fontSize: FONT_SIZES.sm, 
    color: COLORS.text.secondary, 
    fontFamily: FONTS.gilroy.regular,
    lineHeight: 20 
  },
  readMore: { 
    color: COLORS.background.appColor, 
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.xs,
    marginTop: 6 
  },
  map: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  price: { 
    fontSize: FONT_SIZES.sm, 
    color: COLORS.text.tertiary,
    fontFamily: FONTS.gilroy.regular
  },
  priceValue: { 
    fontFamily: FONTS.gilroy.bold, 
    fontSize: FONT_SIZES.md, 
    color: COLORS.error
  },
  buyBtn: {
    backgroundColor: COLORS.background.appColor,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buyText: { 
    color: COLORS.white, 
    fontFamily: FONTS.gilroy.bold, 
    fontSize: FONT_SIZES.sm
  },
});
