import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H1, H2, H3, BodyText, H5 } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';

type ListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListScreen'>;

interface ListItem {
  id: number;
  title: string;
  image: string;
  description?: string;
}

interface ListScreenProps {
  navigation: ListScreenNavigationProp;
}

const ListScreen: React.FC<ListScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { title, data, type } = route.params as {
    title: string;
    data: ListItem[];
    type: 'mahotsav' | 'events' | 'tirths';
  };

  const renderListItem = ({ item }: { item: ListItem }) => (
    <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <H5 
            style={[styles.itemTitle, { fontFamily: FONTS.gilroy.semiBold }]} 
            color={COLORS.text.primary} 
            weight='semiBold' 
            size='md'
          >
            {item.title}
          </H5>
        </View>
        
        {item.description && (
          <BodyText 
            style={[styles.description, { fontFamily: FONTS.gilroy.regular }]} 
            color={COLORS.text.secondary} 
            size='sm'
            numberOfLines={2}
          >
            {item.description}
          </BodyText>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <H5 
          style={[styles.headerTitle, { fontFamily: FONTS.gilroy.bold }]} 
          color={COLORS.text.primary} 
          weight='semiBold' 
          size='md'
        >
          {title}
        </H5>
        <View style={styles.placeholder} />
      </View>

      {/* List */}
      <FlatList
        data={data}
        renderItem={renderListItem}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={renderSeparator}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
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
    borderRadius: 8,
  },
  headerTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.xl,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    shadowColor: COLORS.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    marginRight: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.background.tertiary,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    marginBottom: 4,
  },
  itemTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.md,
  },
  description: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border.light,
    marginVertical: 8,
  },
});

export default ListScreen;
