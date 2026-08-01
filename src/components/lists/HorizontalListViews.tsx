import SpotlightCard from "../cards/SpotlightCard";
import { BodyText, H3, H4, H5 } from "../Text";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/colors";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type HorizontalListProps = {
  title: string;
  listData: any[];
  type?: 'mahotsav' | 'events' | 'tirths';
  showAll?: boolean;
  onItemPress?: (item: any) => void;
  onViewAllPress?: () => void;
};

const HorizontalListViews = ({title,listData,type,showAll,onItemPress,onViewAllPress}: HorizontalListProps) => {
  const navigation = useNavigation<NavigationProp>();
  
  // Determine empty state message based on title
  const getEmptyMessage = () => {
    if (title === "LIVE Updates") {
      return "Updates will come soon. Stay tuned.";
    } else if (title === "Today's Events") {
      return "Events will be shown from 15th november";
    }
    return "No items available";
  };
  
  const handleCardPress = (item: any) => {
    if (onItemPress) {
      onItemPress(item);
      return;
    }

    if (item?.link) {
      navigation.navigate('TirthWebView', {
        url: item.link,
        title: item.title || 'Tirth Details'
      });
    }
  };

  return (
    <View style={styles.container}>
        <View style={styles.titleContainer}>   
    <H5 style={styles.title} weight="semiBold">{title}</H5>
    {showAll && (
      <TouchableOpacity 
        style={styles.viewAll}
        onPress={() => {
          if (onViewAllPress) {
            onViewAllPress();
            return;
          }

          if (type === 'events') {
            navigation.navigate('Events');
            return;
          }

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
          View All
        </BodyText>
      </TouchableOpacity>
    )}
    </View>
    {listData && listData.length > 0 ? (
      type === 'events' ? (
        <View style={styles.eventsList}>
          {listData.map((event) => (
            <TouchableOpacity
              key={event?.id}
              activeOpacity={0.8}
              onPress={() => {
                // Events remain non-clickable for now
              }}
            >
              <View style={styles.eventRow}>
                <View style={styles.eventDot} />
                <View style={styles.eventTextWrapper}>
                  <BodyText color={COLORS.text.primary} size='sm' weight='semiBold'>
                    {event?.title}
                  </BodyText>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.eventMeta}>
                    {[event?.time, event?.location].filter(Boolean).join(' • ')}
                  </BodyText>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <ScrollView
          horizontal
          style={{ flex: 1, paddingVertical: 16, paddingLeft: 16 }}
          showsHorizontalScrollIndicator={false}
        >
          {listData.map((item, index) => (
            <View
              key={item?.id}
              style={{ marginRight: index === listData.length - 1 ? 16 : 12 }}
            >
              <SpotlightCard
                image={item?.image}
                categories={item?.categories}
                title={item?.title}
                onPress={() => handleCardPress(item)}
              />
            </View>
          ))}
        </ScrollView>
      )
    ) : (
      <View style={styles.emptyContainer}>
        <BodyText style={styles.emptyText} color={COLORS.text.secondary} size='md'>
          {getEmptyMessage()}
        </BodyText>
      </View>
    )}
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
  emptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  eventsList: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.background.appColor,
    marginTop: 6,
    marginRight: 10,
  },
  eventTextWrapper: {
    flex: 1,
  },
  eventMeta: {
    marginTop: 2,
  },
});

export default HorizontalListViews;