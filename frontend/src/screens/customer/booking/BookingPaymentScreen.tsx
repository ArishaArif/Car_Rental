import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList, PaymentMethod } from '../../../types';
import { useTheme } from '../../../theme';
import { useBooking } from '../../../context/BookingContext';
import { ScreenContainer, Header, Card, Button, Input, EmptyState } from '../../../components/common';
import { BookingProgress } from '../../../components/booking';

type BookingPaymentNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'BookingPayment'
>;
type BookingPaymentRouteProp = RouteProp<CustomerStackParamList, 'BookingPayment'>;

interface BookingPaymentProps {
  navigation: BookingPaymentNavProp;
  route: BookingPaymentRouteProp;
}

type SimulationOutcome = 'success' | 'failure';
type PaymentState = 'idle' | 'processing' | 'failed' | 'success';

export const BookingPaymentScreen: React.FC<BookingPaymentProps> = ({
  navigation,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { draft, confirmBooking } = useBooking();

  const [method, setMethod] = useState<PaymentMethod>('Card');
  const [outcome, setOutcome] = useState<SimulationOutcome>('success');
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [processingStage, setProcessingStage] = useState<string>('Initializing...');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Card Form State
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(draft?.customer?.fullName || 'Muhammad Ahmed');
  const [expiry, setExpiry] = useState('08/28');
  const [cvv, setCvv] = useState('789');

  // JazzCash State
  const [jazzCashNumber, setJazzCashNumber] = useState(draft?.customer?.phone || '0300 1234567');
  const [cnicLast6, setCnicLast6] = useState('984210');

  // EasyPaisa State
  const [easyPaisaNumber, setEasyPaisaNumber] = useState(draft?.customer?.phone || '0345 9876543');
  const [accountTitle, setAccountTitle] = useState(draft?.customer?.fullName || 'Muhammad Ahmed');

  if (!draft) {
    return (
      <ScreenContainer
        header={
          <Header
            title="Payment"
            showBack
            onBackPress={() => navigation.goBack()}
          />
        }
      >
        <EmptyState
          title="No Active Booking"
          message="Please restart the booking process from vehicle details."
          actionTitle="Back to Fleet"
          onAction={() => navigation.navigate('CustomerHome')}
        />
      </ScreenContainer>
    );
  }

  const { pricing } = draft;

  const handlePayPress = async () => {
    setPaymentState('processing');
    setErrorMessage('');
    setProcessingStage('Connecting to secure banking gateway...');

    // Stage 1
    setTimeout(() => {
      setProcessingStage(
        method === 'Card'
          ? 'Authorizing 3D-Secure Card Verification...'
          : `Dispatching in-app PIN request to ${method}...`
      );
    }, 800);

    // Stage 2
    setTimeout(async () => {
      if (outcome === 'failure') {
        setPaymentState('failed');
        setErrorMessage(
          method === 'Card'
            ? 'Transaction Declined (ERR_402): Insufficient card balance or payment network timeout. Please verify details or try another payment method.'
            : `Wallet Request Failed (ERR_TIMEOUT): ${method} authorization request timed out or was rejected by user.`
        );
      } else {
        try {
          const booking = await confirmBooking(method);
          setPaymentState('success');
          navigation.navigate('BookingConfirmation', { bookingId: booking.id });
        } catch (e: any) {
          setPaymentState('failed');
          setErrorMessage(e?.message || 'Unexpected booking creation error');
        }
      }
    }, 1800);
  };

  const handleRetry = () => {
    setPaymentState('idle');
    setErrorMessage('');
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Secure Payment"
          subtitle="Select payment method & checkout"
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
      footer={
        paymentState !== 'processing' ? (
          <View
            style={[
              styles.footerBar,
              {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
                padding: spacing.md,
              },
            ]}
          >
            <View style={styles.footerPriceCol}>
              <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs, fontWeight: '600' }}>
                TOTAL AMOUNT
              </Text>
              <Text
                style={[
                  styles.footerPrice,
                  {
                    color: colors.primary,
                    fontSize: typography.fontSizes.xxl,
                    fontWeight: typography.fontWeights.heavy,
                  },
                ]}
              >
                ${pricing.total}
              </Text>
            </View>

            <Button
              title={`Pay $${pricing.total} via ${method}`}
              variant="primary"
              size="large"
              onPress={handlePayPress}
              style={{ flex: 1, marginLeft: 16 }}
            />
          </View>
        ) : null
      }
    >
      <BookingProgress currentStep="payment" />

      {/* Full Screen / In-flight Processing Overlay */}
      {paymentState === 'processing' ? (
        <View style={styles.processingWrapper}>
          <Card
            variant="elevated"
            padding="large"
            style={[styles.processingCard, { borderColor: colors.primary, backgroundColor: colors.surface }]}
          >
            <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 16 }} />
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.lg,
                fontWeight: typography.fontWeights.bold,
                textAlign: 'center',
              }}
            >
              Processing Payment...
            </Text>
            <Text
              style={{
                color: colors.primary,
                fontSize: typography.fontSizes.sm,
                fontWeight: '600',
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              {processingStage}
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: typography.fontSizes.xs,
                marginTop: 12,
                textAlign: 'center',
                lineHeight: 18,
              }}
            >
              Please do not close the app or navigate away while the transaction is securely tokenized.
            </Text>
          </Card>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={[styles.content, { padding: spacing.md }]}>
        {/* Prototype Environment Notice */}
        <Card
          variant="flat"
          padding="small"
          style={[styles.prototypeCard, { borderColor: colors.border }]}
        >
          <Text style={{ color: colors.warning, fontSize: 13, fontWeight: '700' }}>
            🛠️ Prototype Sandbox Payment
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
            This is a frontend demonstration. No real bank accounts, cards, or mobile wallets will be charged.
          </Text>
        </Card>

        {/* Reviewer Simulation Selector */}
        <Card
          variant="elevated"
          padding="medium"
          style={[styles.simulatorBox, { borderColor: colors.border, marginTop: spacing.md }]}
        >
          <View style={styles.simHeaderRow}>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' }}>
              🧪 Simulator Outcome Mode (For Testing):
            </Text>
          </View>
          <View style={styles.simPillsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setOutcome('success')}
              style={[
                styles.simPill,
                {
                  backgroundColor: outcome === 'success' ? colors.accent : colors.surfaceVariant,
                  borderColor: outcome === 'success' ? colors.accent : colors.border,
                  borderRadius: borderRadius.sm,
                },
              ]}
            >
              <Text
                style={{
                  color: outcome === 'success' ? '#FFFFFF' : colors.textSecondary,
                  fontSize: typography.fontSizes.xs,
                  fontWeight: '700',
                }}
              >
                ✓ Simulate Success
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setOutcome('failure')}
              style={[
                styles.simPill,
                {
                  backgroundColor: outcome === 'failure' ? colors.danger : colors.surfaceVariant,
                  borderColor: outcome === 'failure' ? colors.danger : colors.border,
                  borderRadius: borderRadius.sm,
                },
              ]}
            >
              <Text
                style={{
                  color: outcome === 'failure' ? '#FFFFFF' : colors.textSecondary,
                  fontSize: typography.fontSizes.xs,
                  fontWeight: '700',
                }}
              >
                ✕ Simulate Failure (Test Retry)
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Failure Message & Retry Banner */}
        {paymentState === 'failed' ? (
          <Card
            variant="elevated"
            padding="medium"
            style={[
              styles.errorCard,
              {
                borderColor: colors.danger,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                marginTop: spacing.md,
              },
            ]}
          >
            <View style={styles.errorHeader}>
              <Text style={{ fontSize: 24, marginRight: 8 }}>❌</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.danger, fontSize: typography.fontSizes.md, fontWeight: 'bold' }}>
                  Payment Failed
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs, marginTop: 4, lineHeight: 18 }}>
                  {errorMessage}
                </Text>
              </View>
            </View>

            <View style={styles.retryActionRow}>
              <Button
                title="Retry Payment"
                variant="primary"
                size="medium"
                onPress={handleRetry}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Change Method"
                variant="secondary"
                size="medium"
                onPress={() => {
                  setPaymentState('idle');
                  setOutcome('success');
                }}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        ) : null}

        {/* Payment Method Tabs */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
              marginBottom: spacing.xs,
            },
          ]}
        >
          Select Payment Method
        </Text>

        <View style={styles.methodsRow}>
          {/* Card Option */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setMethod('Card');
              setPaymentState('idle');
            }}
            style={[
              styles.methodCard,
              {
                backgroundColor: method === 'Card' ? 'rgba(0, 229, 255, 0.12)' : colors.surface,
                borderColor: method === 'Card' ? colors.primary : colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Text style={styles.methodIcon}>💳</Text>
            <Text
              style={[
                styles.methodTitle,
                {
                  color: method === 'Card' ? colors.primary : colors.textPrimary,
                  fontSize: typography.fontSizes.sm,
                  fontWeight: method === 'Card' ? '700' : '600',
                },
              ]}
            >
              Credit / Debit
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 10 }}>Visa / Mastercard</Text>
          </TouchableOpacity>

          {/* JazzCash Option */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setMethod('JazzCash');
              setPaymentState('idle');
            }}
            style={[
              styles.methodCard,
              {
                backgroundColor: method === 'JazzCash' ? 'rgba(0, 229, 255, 0.12)' : colors.surface,
                borderColor: method === 'JazzCash' ? colors.primary : colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Text style={styles.methodIcon}>📱</Text>
            <Text
              style={[
                styles.methodTitle,
                {
                  color: method === 'JazzCash' ? colors.primary : colors.textPrimary,
                  fontSize: typography.fontSizes.sm,
                  fontWeight: method === 'JazzCash' ? '700' : '600',
                },
              ]}
            >
              JazzCash
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 10 }}>Mobile Wallet</Text>
          </TouchableOpacity>

          {/* EasyPaisa Option */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setMethod('EasyPaisa');
              setPaymentState('idle');
            }}
            style={[
              styles.methodCard,
              {
                backgroundColor: method === 'EasyPaisa' ? 'rgba(0, 229, 255, 0.12)' : colors.surface,
                borderColor: method === 'EasyPaisa' ? colors.primary : colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Text style={styles.methodIcon}>🟢</Text>
            <Text
              style={[
                styles.methodTitle,
                {
                  color: method === 'EasyPaisa' ? colors.primary : colors.textPrimary,
                  fontSize: typography.fontSizes.sm,
                  fontWeight: method === 'EasyPaisa' ? '700' : '600',
                },
              ]}
            >
              EasyPaisa
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 10 }}>Digital Account</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Payment Details Forms */}
        <View style={{ marginTop: spacing.md }}>
          {method === 'Card' && (
            <Card variant="elevated" padding="medium" style={{ borderColor: colors.border }}>
              <Input
                label="Card Number"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
                leftIcon={<Text style={{ fontSize: 16 }}>💳</Text>}
              />

              <Input
                label="Cardholder Name"
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="words"
                leftIcon={<Text style={{ fontSize: 16 }}>👤</Text>}
              />

              <View style={styles.cardInlineRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Input
                    label="Expiry Date"
                    placeholder="MM/YY"
                    value={expiry}
                    onChangeText={setExpiry}
                    keyboardType="numeric"
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Input
                    label="CVV / CVC"
                    placeholder="3 Digits"
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    secureTextEntry
                  />
                </View>
              </View>
            </Card>
          )}

          {method === 'JazzCash' && (
            <Card variant="elevated" padding="medium" style={{ borderColor: colors.border }}>
              <Input
                label="JazzCash Mobile Account Number"
                placeholder="03XX XXXXXXX"
                value={jazzCashNumber}
                onChangeText={setJazzCashNumber}
                keyboardType="phone-pad"
                leftIcon={<Text style={{ fontSize: 16 }}>📱</Text>}
              />

              <Input
                label="CNIC Last 6 Digits"
                placeholder="e.g. 984210"
                value={cnicLast6}
                onChangeText={setCnicLast6}
                keyboardType="numeric"
                leftIcon={<Text style={{ fontSize: 16 }}>🪪</Text>}
              />

              <View
                style={[
                  styles.walletTip,
                  { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm },
                ]}
              >
                <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, lineHeight: 18 }}>
                  💡 An authorization request for <Text style={{ color: colors.primary, fontWeight: '700' }}>${pricing.total}</Text> will be dispatched to your JazzCash app. Enter your MPIN to finalize.
                </Text>
              </View>
            </Card>
          )}

          {method === 'EasyPaisa' && (
            <Card variant="elevated" padding="medium" style={{ borderColor: colors.border }}>
              <Input
                label="EasyPaisa Mobile Number"
                placeholder="03XX XXXXXXX"
                value={easyPaisaNumber}
                onChangeText={setEasyPaisaNumber}
                keyboardType="phone-pad"
                leftIcon={<Text style={{ fontSize: 16 }}>📱</Text>}
              />

              <Input
                label="Account Title"
                placeholder="Full Name on Account"
                value={accountTitle}
                onChangeText={setAccountTitle}
                leftIcon={<Text style={{ fontSize: 16 }}>👤</Text>}
              />

              <View
                style={[
                  styles.walletTip,
                  { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm },
                ]}
              >
                <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, lineHeight: 18 }}>
                  💡 Please verify the in-app confirmation prompt or one-time approval notification on your EasyPaisa phone.
                </Text>
              </View>
            </Card>
          )}
        </View>

        {/* Order Price Summary Recap */}
        <Card
          variant="flat"
          padding="medium"
          style={[styles.recapCard, { borderColor: colors.border, marginTop: spacing.md }]}
        >
          <View style={styles.recapRow}>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs }}>
              Vehicle Rate ({draft.rentalDays} days)
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs, fontWeight: '600' }}>
              ${pricing.subtotal}
            </Text>
          </View>

          <View style={[styles.recapRow, { marginTop: 4 }]}>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs }}>
              Service & Roadside Fee
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs, fontWeight: '600' }}>
              ${pricing.serviceFee}
            </Text>
          </View>

          <View style={[styles.recapRow, { marginTop: 4 }]}>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs }}>
              Sales Tax (VAT)
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs, fontWeight: '600' }}>
              ${pricing.taxes}
            </Text>
          </View>

          <View style={[styles.recapRow, { marginTop: 4 }]}>
            <Text style={{ color: colors.accent, fontSize: typography.fontSizes.xs, fontWeight: '600' }}>
              Refundable Deposit
            </Text>
            <Text style={{ color: colors.accent, fontSize: typography.fontSizes.xs, fontWeight: '700' }}>
              ${pricing.securityDeposit}
            </Text>
          </View>

          <View style={[styles.recapDivider, { backgroundColor: colors.border, marginVertical: 8 }]} />

          <View style={styles.recapRow}>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '700' }}>
              Total Payable
            </Text>
            <Text style={{ color: colors.primary, fontSize: typography.fontSizes.md, fontWeight: '800' }}>
              ${pricing.total}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  prototypeCard: {
    borderWidth: 1,
  },
  simulatorBox: {
    borderWidth: 1,
  },
  simHeaderRow: {
    marginBottom: 8,
  },
  simPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  simPill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCard: {
    borderWidth: 1.5,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  retryActionRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodCard: {
    flex: 1,
    padding: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  methodIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  methodTitle: {
    letterSpacing: -0.2,
  },
  cardInlineRow: {
    flexDirection: 'row',
  },
  walletTip: {
    padding: 10,
    marginTop: 4,
  },
  recapCard: {
    borderWidth: 1,
  },
  recapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recapDivider: {
    height: 1,
  },
  processingWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 14, 26, 0.85)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  processingCard: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  footerPriceCol: {
    justifyContent: 'center',
  },
  footerPrice: {
    letterSpacing: -0.5,
  },
});
