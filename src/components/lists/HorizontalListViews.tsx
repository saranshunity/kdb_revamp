import SpotlightCard from "../cards/SpotlightCard";
import { BodyText, H3, H4, H5 } from "../Text";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/colors";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HorizontalListViews = ({title,listData,type,showAll}: {title: string,listData: any[], type?: 'mahotsav' | 'events' | 'tirths', showAll?: boolean}) => {
  const navigation = useNavigation<NavigationProp>();
  return (
    <View style={styles.container}>
        <View style={styles.titleContainer}>   
    <H5 style={styles.title} weight="semiBold">{title}</H5>
    {showAll && (
      <TouchableOpacity 
        style={styles.viewAll}
        onPress={() => {
          if (type) {
            navigation.navigate('ListScreen', {
              title: title,
              data: listData,
              type: type
            });
          }
        }}
      >
        <BodyText color={COLORS.appColor} size='md' weight='semiBold'>
          Show All
        </BodyText>
      </TouchableOpacity>
    )}
    </View>
    <ScrollView horizontal style={{ flex: 1, padding: 16 }} showsHorizontalScrollIndicator={false}>
    {listData?.map((item) => (
    <SpotlightCard
    key={item?.id}
    image={item?.image}
    categories={item?.categories}
    title={item?.title}
    onPress={() => {
      // If item has a link, navigate to WebView
      if (item?.link) {
        navigation.navigate('TirthWebView', {
          url: item.link,
          title: item.title || 'Tirth Details'
        });
      } else {
        console.log("Card Pressed - No link available");
      }
    }}
    />
    ))}
    
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  flex:1,
//   marginVertical: 16
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