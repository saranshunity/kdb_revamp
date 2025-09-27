import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H1, H2, H3, BodyText, ButtonTextPrimary, H4, H5 } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import SpotlightCard from '../../components/cards/SpotlightCard';
import HorizontalListViews from '../../components/lists/HorizontalListViews';
import QuickLinkItem from '../../components/QuickLinks';
import MahotsavHulchal from './components/MahotsavHulchal';
import TirthsList from './components/TirthsList';
import TodaysEvents from '../events/components/TodaysEvents';
import Ionicons from "react-native-vector-icons/Ionicons";

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const stackNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const quickActions = [
    { id: 1, title: 'Transfer Money', icon: '💸', color: COLORS.primary },
    { id: 2, title: 'Pay Bills', icon: '📄', color: COLORS.info },
    { id: 3, title: 'Deposit Check', icon: '📷', color: COLORS.success },
    { id: 4, title: 'View Statements', icon: '📊', color: COLORS.warning },
  ];

  const recentTransactions = [
    {
      id: 1,
      description: 'Coffee Shop',
      amount: '-$4.50',
      date: 'Today',
      type: 'debit',
    },
    {
      id: 2,
      description: 'Salary Deposit',
      amount: '+$3,500.00',
      date: 'Yesterday',
      type: 'credit',
    },
    {
      id: 3,
      description: 'Grocery Store',
      amount: '-$89.32',
      date: '2 days ago',
      type: 'debit',
    },
    {
      id: 4,
      description: 'ATM Withdrawal',
      amount: '-$100.00',
      date: '3 days ago',
      type: 'debit',
    },
  ];

  const mahotsavHulchal = [

    {
      id: 1,
      title: 'Mahotsav Hulchal',
      image: 'https://picsum.photos/600/400',
      categories: ['Coffee', 'Cultural Tour'],
      price: 28,
      isFavorite: true,
    },
    {
      id: 2,
      title: 'Mahotsav Hulchal',
      image: 'https://picsum.photos/600/400',
      categories: ['Coffee', 'Cultural Tour'],
      price: 28,
      isFavorite: true,
    },
  ];

  const tirthsList = [

    {
      id: 1,
      title: 'Kuala Lumpur, Indonesia',
      image: 'https://picsum.photos/600/400',
      categories: ['Cultural Tour'],
      price: 28,
      isFavorite: true,
      rating:false,
      time:'2025',
    },
  

    {
      id: 2,
      title: 'Toronto, Canada',
      image: 'https://picsum.photos/600/400',
      categories: ['Cultural Tour'],
      price: 28,
      isFavorite: true,
      rating:false,
      time:'2024',
    },
    {
      id: 3,
      title: 'Sydney, Australia',
      image: 'https://picsum.photos/600/400',
      categories: ['Cultural Tour'],
      price: 28,
      isFavorite: true,
      rating:false,
      time:'2023',
    },
    {
      id: 4,
      title: 'London, UK',
      image: 'https://picsum.photos/600/400',
      categories: ['Cultural Tour'],
      price: 28,
      isFavorite: true,
      rating:false,
      time:'2023',
    },
    {
      id: 5,
      title: 'Mauritius',
      image: 'https://picsum.photos/600/400',
      categories: ['Cultural Tour'],
      price: 28,
      isFavorite: true,
      rating:false,
      time:'2022',
    },
  ];

  const todaysEventsDataArray = [

    {
      id: 1,
      title: 'The Romanian – Solo Exhibition',
      image: 'https://picsum.photos/600/400',
      categories: ['Art', 'Exhibition'],
    },
    {
      id: 2,
      title: 'M.A in Arts & Management',
      image: 'https://picsum.photos/600/400',
      categories: ['Art', 'Exhibition'],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with App Color Background */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <H2 style={styles.greetingText} color={COLORS.text.primary} weight='bold' size='lg'>
                Hello, John Doe
              </H2>
              <BodyText style={styles.addressText} color={COLORS.text.primary} size='sm'>
                123 Main Street, City, State 12345
              </BodyText>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card */}
      <View style={styles.contentContainer}>
        <H5 style={styles.quickLinkTitle} color={COLORS.primary} weight='semiBold' size='lg'>Mahotsav related Links</H5>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.quickLinkContainer}
          contentContainerStyle={styles.quickLinkContent}
        >
        <QuickLinkItem 
          key="events-1" 
          icon="restaurant-outline" 
          label="Events" 
          onPress={() => stackNavigation.navigate('Events')}
        />
      <QuickLinkItem 
        key="stalls" 
        icon="cart-outline" 
        label="Stalls" 
        onPress={() => stackNavigation.navigate('Stalls')}
      />
      <QuickLinkItem 
        key="hotels" 
        icon="bed-outline" 
        label="Live Shows" 
        onPress={() => console.log('Hotels pressed')}
      />
      <QuickLinkItem 
        key="events-2" 
        icon="calendar-outline" 
        label="Quiz" 
        onPress={() => stackNavigation.navigate('Events')}
      />
        </ScrollView>
        <View style={{marginTop: 26}}/>
        <MahotsavHulchal listData={mahotsavHulchal} />
        <TodaysEvents listData={todaysEventsDataArray} />
      <View style={styles.promotionalCard}>
          <View style={styles.promotionalContent}>
            <H3 color={COLORS.primary} weight='bold' size='lg'>
              Locate your family members
            </H3>
            <BodyText
              color={COLORS.secondary}
              size='sm'
              style={styles.promotionalText}
            >
              Use your KDB card for all purchases and earn 2% cashback on every
              transaction.
            </BodyText>
            <TouchableOpacity 
              style={styles.promotionalButton}
              onPress={() => stackNavigation.navigate('FamilyMembers')}
            >
              <ButtonTextPrimary size='md'>Locate Now</ButtonTextPrimary>
            </TouchableOpacity>
          </View>
          <View style={styles.promotionalIcon}>
            <BodyText size='3xl'>💳</BodyText>
          </View>
        </View>
        <TirthsList listData={tirthsList} />
      </View>
     
        {/* <View style={styles.balanceCard}>
          <BodyText color={COLORS.background.primary} size='md' weight='medium'>
            Total Balance
          </BodyText>
          <H1
            color={COLORS.background.primary}
            weight='bold'
            size='4xl'
            style={styles.balanceAmount}
          >
            $12,456.78
          </H1>
          <View style={styles.balanceDetails}>
            <BodyText color={COLORS.background.primary} size='sm'>
              Checking: $8,456.78
            </BodyText>
            <BodyText color={COLORS.background.primary} size='sm'>
              Savings: $4,000.00
            </BodyText>
          </View>
        </View> */}

        {/* Quick Actions */}
        {/* <View style={styles.section}>
          <H2
            color={COLORS.primary}
            weight='bold'
            size='xl'
            style={styles.sectionTitle}
          >
            Quick Actions
          </H2>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(action => (
              <TouchableOpacity key={action.id} style={styles.quickActionItem}>
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: action.color + '20' },
                  ]}
                >
                  <BodyText size='2xl'>{action.icon}</BodyText>
                </View>
                <BodyText
                  color={COLORS.primary}
                  size='sm'
                  weight='medium'
                  style={styles.quickActionText}
                >
                  {action.title}
                </BodyText>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}

        {/* Recent Transactions */}
        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <H2 color={COLORS.primary} weight='bold' size='xl'>
              Recent Transactions
            </H2>
            <TouchableOpacity>
              <BodyText color={COLORS.primary} size='md' weight='medium'>
                View All
              </BodyText>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            {recentTransactions.map(transaction => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionItem}
              >
                <View style={styles.transactionLeft}>
                  <View
                    style={[
                      styles.transactionIcon,
                      {
                        backgroundColor:
                          transaction.type === 'credit'
                            ? COLORS.success + '20'
                            : COLORS.error + '20',
                      },
                    ]}
                  >
                    <BodyText size='lg'>
                      {transaction.type === 'credit' ? '📈' : '📉'}
                    </BodyText>
                  </View>
                  <View style={styles.transactionDetails}>
                    <BodyText color={COLORS.primary} size='md' weight='medium'>
                      {transaction.description}
                    </BodyText>
                    <BodyText color={COLORS.tertiary} size='sm'>
                      {transaction.date}
                    </BodyText>
                  </View>
                </View>
                <BodyText
                  color={
                    transaction.type === 'credit'
                      ? COLORS.success
                      : COLORS.error
                  }
                  size='md'
                  weight='bold'
                >
                  {transaction.amount}
                </BodyText>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}


      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary
  },
  headerContainer: {
    backgroundColor: COLORS.background.primary,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.lg,
    marginBottom: 2,
  },
  addressText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
    opacity: 0.9,
  },
  settingsButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
    backgroundColor: COLORS.background.tertiary,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 24,
    marginBottom: 32,
    padding: 24,
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceAmount: {
    marginVertical: 8,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    textAlign: 'center',
  },
  transactionsList: {
    paddingHorizontal: 24,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  promotionalCard: {
    backgroundColor: COLORS.background.appColor + '10',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.background.appColor + '30',
    marginBottom: 30,
  },
  promotionalContent: {
    flex: 1,
  },
  promotionalText: {
    marginVertical: 8,
    lineHeight: 20,
  },
  promotionalButton: {
    backgroundColor: COLORS.background.appColor,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  promotionalIcon: {
    marginLeft: 16,
  },
  spotlightTitle: {
    marginBottom: 6,
    paddingHorizontal: 24,
  },
  contentContainer: {
   marginTop: 20,
  },
  quickLinkContainer: {
    marginBottom: 16,
  },
  quickLinkContent: {
    paddingHorizontal: 8,
    flexDirection: 'row',
  },
  quickLinkTitle: {
    marginBottom: 10,
    paddingHorizontal: 20,
  },
});

export default HomeScreen;
