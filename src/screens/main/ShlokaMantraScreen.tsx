import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H2, BodyText } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

type ShlokaMantraScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ShlokaMantra'>;

interface Shloka {
  id: string;
  title: string;
  number: number;
  description?: string;
}

// Sample shlokas
const SHLOKAS: Shloka[] = Array.from({ length: 18 }, (_, i) => ({
  id: `shloka-${i + 1}`,
  title: `Shloka ${i + 1}`,
  number: i + 1,
  description: `Bhagavad Gita Shloka ${i + 1}`,
}));

const ShlokaMantraScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ShlokaMantraScreenNavigationProp>();

  const renderShlokaItem = ({ item }: { item: Shloka }) => {
    return (
      <TouchableOpacity
        style={styles.shlokaItem}
        activeOpacity={0.7}
      >
        <View style={styles.shlokaNumberContainer}>
          <BodyText
            color={COLORS.primary}
            size="sm"
            weight="bold"
          >
            {item.number}
          </BodyText>
        </View>
        <View style={styles.shlokaContent}>
          <BodyText
            color={COLORS.text.primary}
            size="md"
            weight="semiBold"
          >
            {item.title}
          </BodyText>
          {item.description && (
            <BodyText
              color={COLORS.text.secondary}
              size="sm"
            >
              {item.description}
            </BodyText>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <H2 color={COLORS.text.primary} weight="bold" size="xl">
          18 Shlokas
        </H2>
        <View style={styles.headerRight} />
      </View>

      {/* Shlokas List */}
      <FlatList
        data={SHLOKAS}
        keyExtractor={(item) => item.id}
        renderItem={renderShlokaItem}
        contentContainerStyle={styles.listContent}
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
  },
  headerRight: {
    width: 40,
  },
  listContent: {
    padding: 16,
  },
  shlokaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  shlokaNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shlokaContent: {
    flex: 1,
  },
});

export default ShlokaMantraScreen;
