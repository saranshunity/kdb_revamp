import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import { CULTURAL_EVENTS } from './constants/culturalEvents';

type CulturalEventsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CulturalEvents'
>;

const CulturalEventsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<CulturalEventsScreenNavigationProp>();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />

      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cultural Events</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.highlightCard}>
          <Text style={styles.highlightTitle}>Experience the Mahotsav Soundscape</Text>
          <Text style={styles.highlightSubtitle}>
            Discover devotional evenings, folk fusions, and soulful performances lined up throughout
            the International Gita Mahotsav.
          </Text>
        </View>

        <FlatList
          data={CULTURAL_EVENTS}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <Image source={{ uri: item.image }} style={styles.eventImage} resizeMode="cover" />
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventArtist}>{item.artist}</Text>

                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.metaText}>{item.date}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.metaText}>{item.time}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.metaText}>{item.venue}</Text>
                </View>

                <Text style={styles.eventDescription}>{item.description}</Text>
              </View>
            </View>
          )}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    backgroundColor: COLORS.background.primary,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.primary,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  highlightCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  highlightTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  highlightSubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  separator: {
    height: 16,
  },
  eventCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  eventImage: {
    width: '100%',
    height: 180,
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
  },
  eventArtist: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.background.appColor,
    marginTop: 4,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    columnGap: 8,
  },
  metaText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
  },
  eventDescription: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.primary,
    marginTop: 12,
    lineHeight: 20,
  },
});

export default CulturalEventsScreen;

