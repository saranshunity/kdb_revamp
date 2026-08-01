import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H2, H3, BodyText } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from "react-native-vector-icons/Ionicons";

type AdministrationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Administration'>;

interface AdministrationScreenProps {
  navigation: AdministrationScreenNavigationProp;
}

interface Member {
  id: number;
  name: string;
  position: string;
  organization: string;
  image: string;
}

const MEMBERS_ENDPOINT = 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/members.json?alt=media&token=3f008ed3-c9ec-4500-9791-d358d0d626ad';

const AdministrationScreen: React.FC<AdministrationScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch(MEMBERS_ENDPOINT);
        if (!response.ok) {
          throw new Error('Failed to load members');
        }
        const data = await response.json();
        if (isMounted) {
          setMembers(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError('Unable to load members right now. Please try again.');
          setMembers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMembers();
    return () => {
      isMounted = false;
    };
  }, []);

  const renderMember = (member: Member) => (
    <View key={member.id} style={styles.memberCard}>
      <Image source={{ uri: member.image }} style={styles.memberImage} />
      <View style={styles.memberInfo}>
        <H3 style={styles.memberName} color={COLORS.text.primary} weight='bold' size='lg'>
          {member.name}
        </H3>
        <BodyText style={styles.memberPosition} color={COLORS.primary} size='md' weight='semiBold'>
          {member.position}
        </BodyText>
        <BodyText style={styles.memberOrganization} color={COLORS.text.secondary} size='sm'>
          {member.organization}
        </BodyText>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <H2 style={styles.headerTitle} color={COLORS.text.primary} weight='bold' size='xl'>
          Hierarchy
        </H2>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Introduction */}
        <View style={styles.introSection}>
        
          <BodyText style={styles.introDescription} color={COLORS.text.primary} size='md'>
            The Kurukshetra Development Board is led by distinguished leaders dedicated to the development and preservation of this sacred land.
          </BodyText>
        </View>

        {/* Members List */}
        <View style={styles.membersContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <BodyText style={styles.loadingText} color={COLORS.text.secondary} size='md'>
                Loading members...
              </BodyText>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={COLORS.error || COLORS.text.secondary} />
              <BodyText style={styles.errorText} color={COLORS.text.secondary} size='md'>
                {error}
              </BodyText>
            </View>
          ) : members.length > 0 ? (
            members.map(renderMember)
          ) : (
            <View style={styles.emptyContainer}>
              <BodyText style={styles.emptyText} color={COLORS.text.secondary} size='md'>
                No members found.
              </BodyText>
            </View>
          )}
        </View>
      </ScrollView>
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
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.xl,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  introSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: COLORS.background.tertiary,
    marginBottom: 20,
  },
  introTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.xl,
    marginBottom: 12,
  },
  introDescription: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
  },
  membersContainer: {
    paddingHorizontal: 20,
  },
  memberCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    alignItems: 'center',
  },
  memberImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 16,
    backgroundColor: COLORS.background.secondary,
  },
  memberInfo: {
    alignItems: 'center',
    width: '100%',
  },
  memberName: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
    marginBottom: 8,
    textAlign: 'center',
  },
  memberPosition: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.md,
    marginBottom: 4,
    textAlign: 'center',
  },
  memberOrganization: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginTop: 4,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
  },
  errorContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 16,
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
});

export default AdministrationScreen;
