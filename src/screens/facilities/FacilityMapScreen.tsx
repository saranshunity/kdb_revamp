import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { COLORS } from "../../constants/colors";
import { FONTS, FONT_SIZES } from "../../constants/fonts";
import { WebView } from "react-native-webview";

type FacilityMapNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "FacilityMap"
>;

type FacilityMapRouteParams = {
  title: string;
  pdfUrl: string;
};

const FacilityMapScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<FacilityMapNavigationProp>();
  const route = useRoute();
  const params = (route.params || {}) as FacilityMapRouteParams;

  const title = params.title ?? "Mahotsav Facility";
  const pdfUrl = params.pdfUrl;
  const embeddedUrl = pdfUrl
    ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(pdfUrl)}`
    : undefined;

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

      {embeddedUrl ? (
        <WebView
          source={{ uri: embeddedUrl }}
          style={styles.webView}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loaderText}>Loading parking map…</Text>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color={COLORS.primary} />
          <Text style={styles.emptyTitle}>Map unavailable</Text>
          <Text style={styles.emptySubtitle}>
            The parking map file could not be found. Please try again later.
          </Text>
        </View>
      )}
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
  webView: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background.secondary,
  },
  loaderText: {
    marginTop: 12,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.secondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: COLORS.background.secondary,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.primary,
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.secondary,
    textAlign: "center",
  },
});

export default FacilityMapScreen;

