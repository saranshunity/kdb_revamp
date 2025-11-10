import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, StatusBar } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { COLORS } from "../../constants/colors";
import { FONTS, FONT_SIZES } from "../../constants/fonts";

type FacilityMapNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "FacilityMap"
>;

type FacilityMapRouteParams = {
  latitude: number;
  longitude: number;
  title: string;
};

const FacilityMapScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<FacilityMapNavigationProp>();
  const route = useRoute();
  const params = (route.params || {}) as FacilityMapRouteParams;

  const latitude = params.latitude ?? 29.9655;
  const longitude = params.longitude ?? 76.8279;
  const title = params.title ?? "Mahotsav Facility";

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
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Marker coordinate={{ latitude, longitude }} title={title} />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
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
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.primary,
  },
  headerSpacer: {
    width: 32,
  },
  map: {
    flex: 1,
  },
});

export default FacilityMapScreen;

