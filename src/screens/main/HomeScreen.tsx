import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { H1, H2, H3, BodyText, ButtonTextPrimary } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import SpotlightCard from '../../components/cards/SpotlightCard';
import HorizontalListViews from '../../components/lists/HorizontalListViews';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <BodyText color={COLORS.tertiary} size='md'>
              Good morning,
            </BodyText>
            <H1 color={COLORS.primary} weight='bold' size='2xl'>
              John Doe
            </H1>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <BodyText size='lg'>🔔</BodyText>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
      <HorizontalListViews />
        <View style={styles.balanceCard}>
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
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
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
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
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
        </View>

        {/* Promotional Card */}
        <View style={styles.promotionalCard}>
          <View style={styles.promotionalContent}>
            <H3 color={COLORS.primary} weight='bold' size='lg'>
              Get 2% Cashback
            </H3>
            <BodyText
              color={COLORS.secondary}
              size='md'
              style={styles.promotionalText}
            >
              Use your KDB card for all purchases and earn 2% cashback on every
              transaction.
            </BodyText>
            <TouchableOpacity style={styles.promotionalButton}>
              <ButtonTextPrimary size='md'>Learn More</ButtonTextPrimary>
            </TouchableOpacity>
          </View>
          <View style={styles.promotionalIcon}>
            <BodyText size='3xl'>💳</BodyText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  notificationButton: {
    padding: 8,
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
    backgroundColor: COLORS.info + '10',
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.info + '30',
  },
  promotionalContent: {
    flex: 1,
  },
  promotionalText: {
    marginVertical: 8,
    lineHeight: 20,
  },
  promotionalButton: {
    backgroundColor: COLORS.info,
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
});

export default HomeScreen;
