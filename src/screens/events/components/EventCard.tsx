// EventCard.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FONT_SIZES, FONTS } from "../../../constants/fonts";

type EventCardProps = {
  image?: string;
  title: string;
  time: string;
  location: string;
  isFavorite?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
  onToggleFavorite?: () => void;
};

const EventCard: React.FC<EventCardProps> = ({
  image,
  title,
  time,
  location,
  isFavorite = false,
  onPress,
  onToggleFavorite,
}) => {
  const hasImage = image && image.trim().length > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={onPress}
    >
      {/* Event Image + Favorite - Only render if image exists */}
      {hasImage && (
        <View>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity
            onPress={onToggleFavorite}
            style={styles.favoriteBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? "#FF4C4C" : "#fff"}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Event Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color="#777" />
          <Text style={styles.location} numberOfLines={1}>
            {location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginRight: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  image: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  favoriteBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 6,
    borderRadius: 20,
  },
  infoContainer: {
    padding: 12,
  },
  time: {
    fontSize: FONT_SIZES.sm,
    color: "#E63946",
    fontFamily: FONTS.gilroy.semiBold,
    marginBottom: 4,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.semiBold,
    color: "#111",
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    marginLeft: 4,
    fontSize: 13,
    color: "#555",
    flexShrink: 1,
  },
});

export default EventCard;
