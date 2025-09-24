// components/SpotlightCard.tsx
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import {Icon} from "react-native-vector-icons";

type SpotlightCardProps = {
  image: string;
  categories: string[];
  title: string;
  rating: number;
  price: number;
  currency?: string;
  onPress?: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
};

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  image,
  categories,
  title,
  rating,
  price,
  currency = "$",
  onPress,
  onFavoritePress,
  isFavorite = false,
}) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      {/* Image with heart */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: image }} style={styles.image} />
        <TouchableOpacity style={styles.favoriteBtn} onPress={onFavoritePress}>
          <Icon
            name={isFavorite ? "heart" : "heart-outline"}
            size={22}
            color={isFavorite ? "red" : "#fff"}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.categories}>
          {categories.join(" • ")}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.rating}>
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            <Icon name="star" size={14} color="#2ecc71" />
          </View>
          <Text style={styles.price}>
            {currency}{price} <Text style={styles.perPerson}>/person</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SpotlightCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    marginVertical: 10,
    overflow: "hidden",
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  favoriteBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 6,
  },
  content: {
    padding: 12,
  },
  categories: {
    color: "#666",
    fontSize: 13,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3fef7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingText: {
    fontWeight: "600",
    color: "#27ae60",
    marginRight: 4,
    fontSize: 13,
  },
  price: {
    fontWeight: "700",
    color: "#e67e22",
    fontSize: 15,
  },
  perPerson: {
    color: "#777",
    fontWeight: "400",
    fontSize: 12,
  },
});
