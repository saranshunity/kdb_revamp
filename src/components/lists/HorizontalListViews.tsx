import SpotlightCard from "../cards/SpotlightCard";
import { BodyText, H3, H4 } from "../Text";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/colors";

const HorizontalListViews = ({title,listData}: {title: string,listData: any[]}) => {
  return (
    <View style={styles.container}>
        <View style={styles.titleContainer}>   
    <H4 style={styles.title}>{title}</H4>
    <TouchableOpacity style={styles.viewAll}>
    <BodyText color={COLORS.primary} size='md' weight='medium'>
                View All
              </BodyText>
                 </TouchableOpacity>
    </View>
    <ScrollView horizontal style={{ flex: 1, padding: 16 }} showsHorizontalScrollIndicator={false}>
    {listData?.map((item) => (
    <SpotlightCard
    image={item.image}
    categories={item.categories}
    title={item.title}
    rating={4.5}
    price={item.price}
    onPress={() => console.log("Card Pressed")}
    onFavoritePress={() => console.log("Favorite Pressed")}
    isFavorite={item.isFavorite}
    />
    ))}
    
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