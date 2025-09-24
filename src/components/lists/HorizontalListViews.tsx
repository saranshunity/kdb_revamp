import SpotlightCard from "../cards/SpotlightCard";
import { BodyText, H3, H4 } from "../Text";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/colors";

const HorizontalListViews = () => {
  return (
    <View style={styles.container}>
        <View style={styles.titleContainer}>   
    <H4 style={styles.title}>Mahotsav Hulchal</H4>
    <TouchableOpacity style={styles.viewAll}>
      <BodyText size="sm" color={COLORS.text.secondary} style={styles.viewAllText}>View All</BodyText>
    </TouchableOpacity>
    </View>
    <ScrollView horizontal style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
    <SpotlightCard
    image="https://picsum.photos/600/400"
    categories={["Coffee", "Cultural Tour"]}
    title="Unique Egg Coffee class with Local"
    rating={4.5}
    price={28}
    onPress={() => console.log("Card Pressed")}
    onFavoritePress={() => console.log("Favorite Pressed")}
    isFavorite={true}
    />
     <SpotlightCard
    image="https://picsum.photos/600/400"
    categories={["Coffee", "Cultural Tour"]}
    title="Unique Egg Coffee class with Local"
    rating={4.5}
    price={28}
    onPress={() => console.log("Card Pressed")}
    onFavoritePress={() => console.log("Favorite Pressed")}
    isFavorite={true}
    />
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  flex:1
  },
  titleContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
  },
  viewAll: {
    // No background, no padding, just text with underline
  },
  viewAllText: {
    textDecorationLine: 'underline',
  },
});

export default HorizontalListViews;