import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { FONTS, FONT_SIZES } from "../../constants/fonts";
import { COLORS } from "../../constants/colors";

type SpotlightCardProps = {
  image: string;
  categories: string[];
  title: string;
  onPress?: () => void;
};

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  image,
  categories,
  title,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      {/* Image with heart */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: image }} style={styles.image} />
        {/* <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={onFavoritePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={22}
            color={isFavorite ? "red" : "#fff"}
          />
        </TouchableOpacity> */}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.categories}>
          {categories?.join(" • ")}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default SpotlightCard;

const styles = StyleSheet.create({
  card: {
    width: 280,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    marginBottom: 16,
    overflow: "hidden",
    marginRight: 16,
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  favoriteBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 6,
  },
  content: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    flex: 1,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: COLORS.background.primary,
  },
  categories: {
    color: "#666",
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.regular,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.semiBold,
    color: "#111",
    flexWrap: "wrap",
    lineHeight: 20,
  },
});
