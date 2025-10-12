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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from "react-native-vector-icons/Ionicons";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

type TirthDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TirthDetail'>;
type TirthDetailScreenRouteProp = RouteProp<RootStackParamList, 'TirthDetail'>;

const TirthDetailScreen = () => {
  const [isFavorite, setFavorite] = useState(false);
  const [expandedAbout, setExpandedAbout] = useState(false);
  const [expandedSignificance, setExpandedSignificance] = useState(false);
  const [expandedMythology, setExpandedMythology] = useState(false);
  
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TirthDetailScreenNavigationProp>();
  const route = useRoute<TirthDetailScreenRouteProp>();
  
  const { tirth } = route.params;

  const hasCoordinates = tirth.location.coordinates.latitude && tirth.location.coordinates.longitude;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View>
          <Image
            source={{ uri: tirth.images?.[0] || "https://picsum.photos/500/300" }}
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

        {/* Tirth Info */}
        <View style={styles.content}>
          <Text style={styles.type}>{tirth.district} District</Text>
          <Text style={styles.title}>{tirth.name}</Text>
          {tirth.alternateName ? (
            <Text style={styles.alternateName}>({tirth.alternateName})</Text>
          ) : null}

          {/* Location */}
          <View style={styles.row}>
            <Ionicons name="location-outline" size={18} color="#444" />
            <View style={styles.rowText}>
              <Text style={styles.date}>{tirth.location.address}</Text>
              <Text style={styles.time}>{tirth.district}, Haryana</Text>
            </View>
            {hasCoordinates && (
              <TouchableOpacity>
                <Text style={styles.link}>Directions</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Category */}
          {tirth.category ? (
            <View style={styles.row}>
              <Ionicons name="list-outline" size={18} color="#444" />
              <Text style={styles.rowTextSingle}>{tirth.category}</Text>
            </View>
          ) : null}

          {/* Short Description */}
          {tirth.shortDescription ? (
            <>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.about}>{tirth.shortDescription}</Text>
            </>
          ) : null}

          {/* About / Description */}
          {tirth.description ? (
            <>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.about} numberOfLines={expandedAbout ? undefined : 5}>
                {tirth.description}
              </Text>
              {tirth.description.length > 200 && (
                <TouchableOpacity onPress={() => setExpandedAbout(!expandedAbout)}>
                  <Text style={styles.readMore}>
                    {expandedAbout ? "Read less" : "Read more"}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : null}

          {/* Significance */}
          {tirth.significance ? (
            <>
              <Text style={styles.sectionTitle}>Significance</Text>
              <Text style={styles.about} numberOfLines={expandedSignificance ? undefined : 5}>
                {tirth.significance}
              </Text>
              {tirth.significance.length > 200 && (
                <TouchableOpacity onPress={() => setExpandedSignificance(!expandedSignificance)}>
                  <Text style={styles.readMore}>
                    {expandedSignificance ? "Read less" : "Read more"}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : null}

          {/* Mythology */}
          {tirth.mythology ? (
            <>
              <Text style={styles.sectionTitle}>Mythology</Text>
              <Text style={styles.about} numberOfLines={expandedMythology ? undefined : 5}>
                {tirth.mythology}
              </Text>
              {tirth.mythology.length > 200 && (
                <TouchableOpacity onPress={() => setExpandedMythology(!expandedMythology)}>
                  <Text style={styles.readMore}>
                    {expandedMythology ? "Read less" : "Read more"}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : null}

          {/* Best Time to Visit */}
          {tirth.bestTimeToVisit ? (
            <View style={styles.row}>
              <Ionicons name="calendar-outline" size={18} color="#444" />
              <View style={styles.rowText}>
                <Text style={styles.date}>Best Time to Visit</Text>
                <Text style={styles.time}>{tirth.bestTimeToVisit}</Text>
              </View>
            </View>
          ) : null}

          {/* Opening Hours */}
          {tirth.openingHours ? (
            <View style={styles.row}>
              <Ionicons name="time-outline" size={18} color="#444" />
              <View style={styles.rowText}>
                <Text style={styles.date}>Opening Hours</Text>
                <Text style={styles.time}>{tirth.openingHours}</Text>
              </View>
            </View>
          ) : null}

          {/* Entry Fee */}
          {tirth.entryFee ? (
            <View style={styles.row}>
              <Ionicons name="cash-outline" size={18} color="#444" />
              <View style={styles.rowText}>
                <Text style={styles.date}>Entry Fee</Text>
                <Text style={styles.time}>{tirth.entryFee}</Text>
              </View>
            </View>
          ) : null}

          {/* Facilities */}
          {tirth.facilities && tirth.facilities.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Facilities</Text>
              <View style={styles.facilitiesContainer}>
                {tirth.facilities.map((facility, index) => (
                  <View key={index} style={styles.facilityItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                    <Text style={styles.facilityText}>{facility}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* Location Map */}
          {hasCoordinates && (
            <>
              <Text style={styles.sectionTitle}>Location</Text>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                  latitude: tirth.location.coordinates.latitude,
                  longitude: tirth.location.coordinates.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
                showsScale={true}
              >
                <Marker
                  coordinate={{
                    latitude: tirth.location.coordinates.latitude,
                    longitude: tirth.location.coordinates.longitude,
                  }}
                  title={tirth.name}
                  description={tirth.location.address}
                  pinColor={COLORS.background.appColor}
                />
              </MapView>
            </>
          )}

          {/* Nearby Tirthas */}
          {tirth.nearbyTirthas && tirth.nearbyTirthas.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Nearby Tirthas</Text>
              <View style={styles.nearbyContainer}>
                {tirth.nearbyTirthas.map((nearby, index) => (
                  <TouchableOpacity key={index} style={styles.nearbyItem}>
                    <Ionicons name="location" size={16} color={COLORS.primary} />
                    <Text style={styles.nearbyText}>{nearby}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

export default TirthDetailScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background.primary 
  },
  coverImage: { 
    width: "100%", 
    height: 240,
    backgroundColor: COLORS.background.secondary 
  },
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
    marginBottom: 4 
  },
  alternateName: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.secondary,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  row: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 14 
  },
  rowText: { 
    marginLeft: 10, 
    flex: 1 
  },
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
    marginTop: 16,
    marginBottom: 8 
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
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    marginTop: 8,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  facilityText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.primary,
  },
  nearbyContainer: {
    gap: 8,
  },
  nearbyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  nearbyText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.primary,
  },
});

