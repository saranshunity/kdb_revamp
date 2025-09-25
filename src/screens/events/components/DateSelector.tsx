import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { COLORS } from "../../../constants/colors";
import { FONTS, FONT_SIZES } from "../../../constants/fonts";

type DateItem = {
  day: string;
  date: number;
};

type DateSelectorProps = {
  dates: DateItem[];
  onSelect: (date: DateItem) => void;
};

const DateSelector: React.FC<DateSelectorProps> = ({ dates, onSelect }) => {
  const [selected, setSelected] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);

  const handleSelect = (item: DateItem, index: number) => {
    setSelected(index);
    onSelect(item);
    
    // Auto-scroll to keep selected item visible
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ 
        index: index, 
        animated: true,
        viewPosition: 0.5 // Center the selected item
      });
    }
  };

  const scrollLeft = () => {
    if (flatListRef.current && selected > 0) {
      const newIndex = selected - 1;
      setSelected(newIndex);
      onSelect(dates[newIndex]);
      flatListRef.current.scrollToIndex({ 
        index: newIndex, 
        animated: true,
        viewPosition: 0.5 // Center the selected item
      });
    }
  };

  const scrollRight = () => {
    if (flatListRef.current && selected < dates.length - 1) {
      const newIndex = selected + 1;
      setSelected(newIndex);
      onSelect(dates[newIndex]);
      flatListRef.current.scrollToIndex({ 
        index: newIndex, 
        animated: true,
        viewPosition: 0.5 // Center the selected item
      });
    }
  };

  // No useEffect needed - parent handles initial selection

  return (
    <View style={styles.container}>
      <View style={styles.arrowContainer}>
        <TouchableOpacity 
          style={[styles.arrowButton, selected === 0 && styles.disabledArrow]} 
          onPress={scrollLeft}
          disabled={selected === 0}
        >
          <Text style={[styles.arrowText, selected === 0 && styles.disabledArrowText]}>‹</Text>
        </TouchableOpacity>
        
        <View style={styles.datesContainer}>
          <FlatList
            ref={flatListRef}
            horizontal
            data={dates}
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            onScrollToIndexFailed={(info) => {
              // Fallback for scroll to index
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({ 
                  index: info.index, 
                  animated: true,
                  viewPosition: 0.5 // Center the selected item
                });
              }, 100);
            }}
            renderItem={({ item, index }) => {
              const isActive = selected === index;
              return (
                <TouchableOpacity
                  onPress={() => handleSelect(item, index)}
                  style={[styles.dateBox, isActive && styles.activeDateBox]}
                >
                  <Text style={[styles.day, isActive && styles.activeDay]}>
                    {item?.day}
                  </Text>
                  <Text style={[styles.date, isActive && styles.activeText]}>
                    {item?.date}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.arrowButton, selected === dates.length - 1 && styles.disabledArrow]} 
          onPress={scrollRight}
          disabled={selected === dates.length - 1}
        >
          <Text style={[styles.arrowText, selected === dates.length - 1 && styles.disabledArrowText]}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    // marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    paddingBottom: 12,
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor:'transparent',

  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  arrowText: {
    fontSize: 24,
    color: COLORS.primary,
    fontFamily: FONTS.gilroy.bold,
  },
  disabledArrow: {
    backgroundColor: COLORS.background.tertiary,
    opacity: 0.5,
  },
  disabledArrowText: {
    color: COLORS.text.tertiary,
  },
  datesContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  flatListContent: {
    paddingHorizontal: 4,
  },
  dateBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: COLORS.background.tertiary,
  },
  activeDateBox: {
    backgroundColor: COLORS.background.appColor,
  },
  day: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontFamily: FONTS.gilroy.regular,
  },
  date: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.primary,
  },
  activeText: {
    color: COLORS.text.primary,
    fontFamily: FONTS.gilroy.bold,
  },
  activeDay: {
    color: COLORS.text.primary,
    fontFamily: FONTS.gilroy.bold,
  },
});

export default DateSelector;
