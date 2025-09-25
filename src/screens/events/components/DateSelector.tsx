import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";

type DateItem = {
  day: string;
  date: number;
};

type DateSelectorProps = {
  dates: DateItem[];
  onSelect: (date: DateItem) => void;
};

const DateSelector: React.FC<DateSelectorProps> = ({ dates, onSelect }) => {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (item: DateItem, index: number) => {
    setSelected(index);
    onSelect(item);
  };

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={dates}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isActive = selected === index;
          return (
            <TouchableOpacity
              onPress={() => handleSelect(item, index)}
              style={[styles.dateBox, isActive && styles.activeDateBox]}
            >
              <Text style={[styles.day, isActive && styles.activeText]}>
                {item.day}
              </Text>
              <Text style={[styles.date, isActive && styles.activeText]}>
                {item.date}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  dateBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: "#F9F9F9",
  },
  activeDateBox: {
    backgroundColor: "#FFB703", // highlight color (yellow)
  },
  day: {
    fontSize: 13,
    color: "#555",
  },
  date: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  activeText: {
    color: "#fff",
  },
});

export default DateSelector;
