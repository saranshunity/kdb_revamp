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

type AboutKDBScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AboutKDB'>;

interface AboutKDBScreenProps {
  navigation: AboutKDBScreenNavigationProp;
}

const AboutKDBScreen: React.FC<AboutKDBScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

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
          About KDB
        </H2>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image 
            source={require('../../assets/images/appLogo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <H2 style={styles.appName} color={COLORS.primary} weight='bold' size='2xl'>
            KDB App
          </H2>
          <BodyText style={styles.version} color={COLORS.text.secondary} size='sm'>
            Version 1.0.0
          </BodyText>
        </View>

        {/* About Content */}
        <View style={styles.contentSection}>
          <BodyText style={styles.description} color={COLORS.text.primary} size='md'>
            Kurukshetra as a pilgrimage destination has been in the limelight ever since the days of Mahabharata. Originally it was a pilgrimage visited by millions of pilgrims. However, the destination Kuruksheta also has an additional dimension for being regarded as the cradle of Vedic civilisation and the land of Bhagawadgita. Historically speaking, the antiquity of Kurukshetra dates back to the Indus valley civilisation. Kurukshetra is one of those few destinations, which is a perfect blend of religious sanctity and cultural fervor. Thus, Kurukshetra is an amalgamation of multiple cultural and religious attractions, in the forms of sacred bathing tanks and historical monuments.
          </BodyText>

          <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight='bold' size='lg'>
            Foundation
          </H3>
          
          <BodyText style={styles.description} color={COLORS.text.primary} size='md'>
            With a view to protect the ancient heritage and age old tradition of Kurukshetra the necessity for establishing a Board for preserving the heritage of the pilgrimage was felt by the Bharat Ratna late Sh. Gulzari Lal Nanda, the founder Chairman of Kurukshetra Development Board. The Kurukshetra Development Board was constituted by the Haryana Government on 1st August, 1968 under the Chairmanship of Sh. Gulzari Lal Nanda. The broad objectives for which the Kurukshetra Development Board was constituted include overall comprehensive development of the Kurukshetra Area including its landscaping, renovation of historical buildings and tanks and providing of civic amenities to the visiting pilgrims and tourists as well as up keeping and maintenance of the tirthas.
          </BodyText>

          <BodyText style={styles.description} color={COLORS.text.primary} size='md'>
            After Sh. Gulzari Lal Nanda left the Chairmanship of the Board, Governor of Haryana was appointed as Chairman of the Board w.e.f. 27.6.1990.
          </BodyText>

          <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight='bold' size='lg'>
            Development & Initiatives
          </H3>
          
          <BodyText style={styles.description} color={COLORS.text.primary} size='md'>
            Kurukshetra Development Board has been shouldering the responsibility for the comprehensive and overall development of Kurukshetra region by undertaking various projects for the upliftment of pilgrimages or tirthas. In this endeavour the Board has documentated alll the 134 tirthas highlighting importance of each of the tirthas, their religious significance with elaborate description about their archaeological and architectural grandeur. This website will enable the viewer all information regarding the tirthas and places of tourist and cultural interest in and around Kurukshetra.
          </BodyText>

          <BodyText style={styles.description} color={COLORS.text.primary} size='md'>
            Kurukshetra Development Board ever since its establishment has been consistently trying to fulfill the expectation of the pilgrims and tourists visiting Kurukshetra. In this endeavour it has preserved one of the largest man made water body called Brahamsarover. It is one of the important centres of pilgrimage visited by millions of pilgrims during the Solar Eclipse. The other tirthas developed by the Board include Sannehit Sarovar, Jyotisar, the place where the holy Gita was expounded by Lord Krishna at the out-set of the Mahabharata battle, Bhishmakund at Narkatari, Banganga at Dayalpur, Shalihotra tirtha at Sarsa, where Yaksha-Yudhishiter dialogue was held and Saraswati tirtha at Pehowa.
          </BodyText>

          <BodyText style={styles.description} color={COLORS.text.primary} size='md'>
            A few other tirthas such as Kapilmuni tirtha at Kalayat, Kapisthal tirtha at Kaithal, Rinmochan tirtha at Rasina, Sarpadaman tirtha at Safidon have been taken up by the Board for comprehensive development. The Board also provides modern civic amenities at various tirthas. It has also alloted land to various voluntary organisations for the construction of dharamshalas for providing cheaper accommodation to the visiting pilgrims and tourists. More than 800 rooms are available in these dharamshalas for the stay of pilgrims.
          </BodyText>

          <BodyText style={styles.description} color={COLORS.text.primary} size='md'>
            As a part of the cultural activity of the Board it has also established the Srikrishna Museum and the Kurukshetra Panorama and Science Centre at Kurukshetra, which have become the heartthrob of the tourists and pilgrims, are gaining popularity day by day.
          </BodyText>
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
  logoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES['2xl'],
    marginBottom: 8,
  },
  version: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
  },
  contentSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
    marginTop: 24,
    marginBottom: 12,
  },
  description: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
    marginBottom: 16,
  },
  initiativesList: {
    marginBottom: 16,
  },
  initiativeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  initiativeText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  contactInfo: {
    marginBottom: 32,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    marginLeft: 12,
  },
});

export default AboutKDBScreen;
