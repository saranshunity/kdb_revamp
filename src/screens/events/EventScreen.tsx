import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, StatusBar, ScrollView } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import DateSelector from "./components/DateSelector";
import EventCard from "./components/EventCard";
import FirebaseService, { EventItem } from '../../services/FirebaseService';

type EventsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Events'>;

export default function EventsScreen() {
    const dates = [
        { day: "Sat", date: 15 },
        { day: "Sun", date: 16 },
        { day: "Mon", date: 17 },
        { day: "Tue", date: 18 },
        { day: "Wed", date: 19 },
        { day: "Thu", date: 20 },
        { day: "Fri", date: 21 },
        { day: "Sat", date: 22 },
        { day: "Sun", date: 23 },
        { day: "Mon", date: 24 },
        { day: "Tue", date: 25 },
        { day: "Wed", date: 26 },
        { day: "Thu", date: 27 },
        { day: "Fri", date: 28 },
        { day: "Sat", date: 29 },
        { day: "Sun", date: 30 },
        { day: "Mon", date: 31 },
        { day: "Tue", date: 1 },
        { day: "Wed", date: 2 },
        { day: "Thu", date: 3 },
        { day: "Fri", date: 4 },
        { day: "Sat", date: 5 },
      ];
  const [selectedDate, setSelectedDate] = useState<any>(dates[0]);
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<EventsScreenNavigationProp>();

  // Fetch events from Firebase
  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeToEvents((events) => {
      setAllEvents(events);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Filter events based on selected date
  useEffect(() => {
    if (!selectedDate) return;

    // Format the date to match the event date format (DD-MM-YYYY or DD/MM/YYYY)
    const formatDate = (day: string, date: number) => {
      // You might need to adjust month/year based on your dates array
      // For now, using November 2025 as default month
      const month = 11; // November
      const year = 2025;
      return `${date.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
    };

    const selectedDateStr = formatDate(selectedDate.day, selectedDate.date);
    
    // Filter events that match the selected date
    const filtered = allEvents.filter(event => {
      // Normalize date formats for comparison
      const eventDate = event.date.replace(/\//g, '-');
      const normalizedSelectedDate = selectedDateStr.replace(/\//g, '-');
      return eventDate === normalizedSelectedDate;
    });

    setFilteredEvents(filtered);
  }, [selectedDate, allEvents]);

  const handleDateSelect = useCallback((date: any) => {
    setSelectedDate(date);
  }, []);

  // Format date for display
  const formatDisplayDate = (date: any) => {
    if (!date) return '';
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = 11; // November (based on dates array)
    const year = 2025;
    return `${date.day}, ${monthNames[month - 1]} ${date.date}`;
  };

  const handleEventPress = useCallback((eventId?: string) => {
    navigation.navigate('EventDetail' as any);
  }, [navigation]);



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
        <Text style={styles.header}>Events - {formatDisplayDate(selectedDate)}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* <Text style={styles.monthHeader}>March 2020</Text> */}

      {/* Date Strip */}
      <DateSelector dates={dates} onSelect={handleDateSelect} />

      {/* Events List */}
      {filteredEvents.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false} style={{paddingHorizontal: 16}}>
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              image={event.image}
              title={event.title}
              time={event.time}
              location={event.location}
              isFavorite={event.isFavorite}
              onPress={handleEventPress}
            />
          ))}
        </ScrollView>
      ) : (
                 <View style={styles.emptyContainer}>
           <Text style={styles.emptyText}>No events scheduled for this date</Text>
         </View>
       )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background.secondary 
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
    fontFamily: FONTS.gilroy.semiBold,
    marginLeft: 16,
    marginTop: 20,
    marginBottom: 20,
    color: COLORS.text.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});
