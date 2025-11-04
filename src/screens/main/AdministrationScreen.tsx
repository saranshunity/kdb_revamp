import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  TouchableOpacity,
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

const AdministrationScreen: React.FC<AdministrationScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const members = [
    {
      id: 1,
      name: 'Prof. Ashim Kumar Ghosh',
      position: 'Hon\'ble Governor of Haryana & Chairman',
      organization: 'Kurukshetra Development Board',
      image: 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/heirarchy%2Fgoverner.jpeg?alt=media&token=2ef1b78f-fdbb-48f1-9677-4f994785e96b',
    },
    {
      id: 2,
      name: 'Nayab Singh Saini',
      position: 'Hon\'ble Chief Minister, Haryana & Vice-Chairman',
      organization: 'Kurukshetra Development Board',
      image: 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/heirarchy%2Fcm.jpg?alt=media&token=a4bad021-ea48-4e6c-bc55-f0605098f146',
    },
    {
      id: 3,
      name: 'Vikas Gupta, IAS',
      position: 'Member Secretary',
      organization: 'Kurukshetra Development Board',
      image: 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/heirarchy%2Fms.png?alt=media&token=fc14c83c-f6f6-43e9-8708-e462ee637a26',
    },
    {
      id: 4,
      name: 'Upender Singhal',
      position: 'Honorary Secretary',
      organization: 'Kurukshetra Development Board',
      image: 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/heirarchy%2Fs.png?alt=media&token=923cbf5a-f77e-46ca-9d14-7adbd1831404',
    },
    {
      id: 5,
      name: 'Pankaj Kumar, HCS',
      position: 'Chief Executive Officer',
      organization: 'Kurukshetra Development Board',
      image: 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/heirarchy%2Fceo.jpg?alt=media&token=10b608a9-fec9-4851-804e-fd7b9ce71094',
    },
  ];

  const renderMember = (member: any) => (
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
          {members.map(renderMember)}
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
});

export default AdministrationScreen;
