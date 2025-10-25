import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H1, H2, H3, BodyText, ButtonTextPrimary } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';

type PaymentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Payment'>;
type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Payment'>;

interface PaymentData {
  applicationId: string;
  category: any;
  formData: any;
  amount: number;
  dueDate: string;
}

const PaymentScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  const route = useRoute<PaymentScreenRouteProp>();
  const { applicationId, category, formData } = route.params;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentData: PaymentData = {
    applicationId,
    category,
    formData,
    amount: 5000, // Example amount - should come from category or backend
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 7 days from now
  };

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI Payment',
      description: 'Pay using UPI ID or QR Code',
      icon: 'phone-portrait-outline',
      color: COLORS.primary,
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'Pay using your bank account',
      icon: 'card-outline',
      color: COLORS.secondary,
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay using your card',
      icon: 'wallet-outline',
      color: COLORS.success,
    },
  ];

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleProceedToPayment = () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Select Payment Method', 'Please select a payment method to continue.');
      return;
    }

    Alert.alert(
      'Payment Processing',
      `This is a demo. In production, you would be redirected to ${paymentMethods.find(m => m.id === selectedPaymentMethod)?.name} gateway.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: () => {
            setIsProcessing(true);
            // Simulate payment processing
            setTimeout(() => {
              setIsProcessing(false);
              Alert.alert(
                'Payment Successful!',
                'Your payment has been processed successfully. You will receive a confirmation email shortly.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('Main'),
                  },
                ]
              );
            }, 2000);
          },
        },
      ]
    );
  };

  const renderPaymentMethod = (method: any) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethodCard,
        selectedPaymentMethod === method.id && styles.selectedPaymentMethod,
      ]}
      onPress={() => handlePaymentMethodSelect(method.id)}
      activeOpacity={0.8}
    >
      <View style={styles.paymentMethodContent}>
        <View style={[styles.paymentMethodIcon, { backgroundColor: method.color + '20' }]}>
          <Ionicons name={method.icon} size={24} color={method.color} />
        </View>
        <View style={styles.paymentMethodInfo}>
          <H3 color={COLORS.text.primary} weight='semiBold' size='md'>
            {method.name}
          </H3>
          <BodyText color={COLORS.text.secondary} size='sm'>
            {method.description}
          </BodyText>
        </View>
        <View style={styles.paymentMethodRadio}>
          <View style={[
            styles.radioButton,
            selectedPaymentMethod === method.id && styles.radioButtonSelected,
          ]}>
            {selectedPaymentMethod === method.id && (
              <View style={styles.radioButtonInner} />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <H1 color={COLORS.text.primary} weight='bold' size='lg'>
          Payment
        </H1>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Application Summary */}
        <View style={styles.summaryCard}>
          <H3 color={COLORS.text.primary} weight='semiBold' size='md' style={styles.sectionTitle}>
            Application Summary
          </H3>
          <View style={styles.summaryRow}>
            <BodyText color={COLORS.text.secondary} size='sm'>Firm Name:</BodyText>
            <BodyText color={COLORS.text.primary} size='sm' weight='medium'>
              {paymentData.formData.firmName}
            </BodyText>
          </View>
          <View style={styles.summaryRow}>
            <BodyText color={COLORS.text.secondary} size='sm'>Category:</BodyText>
            <BodyText color={COLORS.text.primary} size='sm' weight='medium'>
              {paymentData.category.name}
            </BodyText>
          </View>
          <View style={styles.summaryRow}>
            <BodyText color={COLORS.text.secondary} size='sm'>Application ID:</BodyText>
            <BodyText color={COLORS.text.primary} size='sm' weight='medium'>
              {paymentData.applicationId}
            </BodyText>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.paymentDetailsCard}>
          <H3 color={COLORS.text.primary} weight='semiBold' size='md' style={styles.sectionTitle}>
            Payment Details
          </H3>
          <View style={styles.amountRow}>
            <BodyText color={COLORS.text.primary} size='lg' weight='semiBold'>
              Stall Fee
            </BodyText>
            <H2 color={COLORS.primary} weight='bold' size='xl'>
              ₹{paymentData.amount.toLocaleString()}
            </H2>
          </View>
          <View style={styles.dueDateRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.text.tertiary} />
            <BodyText color={COLORS.text.tertiary} size='sm' style={styles.dueDateText}>
              Payment due by: {paymentData.dueDate}
            </BodyText>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethodsSection}>
          <H3 color={COLORS.text.primary} weight='semiBold' size='md' style={styles.sectionTitle}>
            Select Payment Method
          </H3>
          {paymentMethods.map(renderPaymentMethod)}
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsCard}>
          <BodyText color={COLORS.text.tertiary} size='xs' style={styles.termsText}>
            By proceeding with the payment, you agree to the terms and conditions of the stall allocation. 
            Payment is non-refundable once processed.
          </BodyText>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View style={styles.paymentButtonContainer}>
        <TouchableOpacity
          style={[
            styles.paymentButton,
            isProcessing && styles.paymentButtonDisabled,
          ]}
          onPress={handleProceedToPayment}
          disabled={isProcessing}
        >
          <ButtonTextPrimary size='md' weight='semiBold'>
            {isProcessing ? 'Processing...' : `Pay ₹${paymentData.amount.toLocaleString()}`}
          </ButtonTextPrimary>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.tertiary,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.background.tertiary,
  },
  paymentDetailsCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.background.tertiary,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDateText: {
    marginLeft: 8,
  },
  paymentMethodsSection: {
    marginTop: 20,
  },
  paymentMethodCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.background.tertiary,
  },
  selectedPaymentMethod: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodRadio: {
    marginLeft: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.text.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  termsCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 100,
    borderWidth: 1,
    borderColor: COLORS.background.tertiary,
  },
  termsText: {
    lineHeight: 18,
    textAlign: 'center',
  },
  paymentButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.background.tertiary,
  },
  paymentButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  paymentButtonDisabled: {
    backgroundColor: COLORS.text.tertiary,
  },
});

export default PaymentScreen;
