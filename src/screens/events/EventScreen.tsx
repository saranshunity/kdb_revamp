import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, StatusBar } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import DateSelector from "./components/DateSelector";
import EventCard from "./components/EventCard";

type EventsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Events'>;

export default function EventsScreen() {
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<EventsScreenNavigationProp>();

  const dates = [
    { day: "Mon", date: 16 },
    { day: "Tue", date: 17 },
    { day: "Wed", date: 18 },
    { day: "Thu", date: 19 },
    { day: "Fri", date: 20 },
    { day: "Sat", date: 21 },
    { day: "Sun", date: 22 },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Events</Text>
        <View style={styles.placeholder} />
      </View>

      <Text style={styles.monthHeader}>March 2020</Text>

      {/* Date Strip */}
      <DateSelector dates={dates} onSelect={(d) => setSelectedDate(d)} />

      {/* Events in Spotlight */}
      <Text style={styles.sectionTitle}>Events in spotlight</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <EventCard
          image="https://picsum.photos/400/300"
          title="The Romanian – Solo Exhibition"
          time="Today at 8:30 PM"
          location="Vicas Art Studio"
          isFavorite
        />
        <EventCard
          image="https://picsum.photos/401/300"
          title="M.A in Arts & Management"
          time="Tomorrow at 9:00 PM"
          location="Vicas Art Studio"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background.primary 
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.primary,
    fontFamily: FONTS.gilroy.bold,
  },
  header: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.primary,
    textAlign: "center",
  },
  placeholder: {
    width: 40, // Same width as back button for centering
  },
  monthHeader: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.bold,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 8,
    color: COLORS.text.primary,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.bold,
    marginLeft: 16,
    marginTop: 20,
    marginBottom: 12,
    color: COLORS.text.primary,
  },
});
