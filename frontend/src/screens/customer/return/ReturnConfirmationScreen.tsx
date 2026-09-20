import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../types';
import { useTheme } from '../../../theme';
import { useBooking } from '../../../context/BookingContext';
import { ScreenContainer, Header, Card, Button, EmptyState } from '../../../components/common';

type ReturnConfirmationNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'ReturnConfirmation'
>;
type ReturnConfirmationRouteProp = RouteProp<CustomerStackParamList, 'ReturnConfirmation'>;

interface ReturnConfirmationProps {
  navigation: ReturnConfirmationNavProp;
  route: ReturnConfirmationRouteProp;
}

export const ReturnConfirmationScreen: React.FC<ReturnConfirmationProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { bookingId } = route.params;
  const { bookings } = useBooking();

  const booking = bookings.find(b => b.id === bookingId);

  if (!booking) {
    return (
      <ScreenContainer
        header={
          <Header
            title="Return Confirmation"
            showBack
            onBackPress={() => navigation.navigate('CustomerHome')}
          />
        }
      >
        <EmptyState
          title="Booking Not Found"
          message="Could not load return confirmation details."
          actionTitle="Go to Home"
          onAction={() => navigation.navigate('CustomerHome')}
        />
      </ScreenContainer>
    );
  }

  const { vehicle } = booking;

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Return Confirmation"
          subtitle={booking.id}
          showBack
          onBackPress={() => navigation.navigate('CustomerHome')}
        />
      }
      footer={
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
          <Button
            title="Home"
            variant="secondary"
            size="large"
            onPress={() => navigation.navigate('CustomerHome')}
            style={{ flex: 1, marginRight: 8 }}
          />

          <Button
            title="View Final Invoice 🧾"
            variant="primary"
            size="large"
            onPress={() => navigation.navigate('FinalInvoice', { bookingId: booking.id })}
            style={{ flex: 1.8 }}
          />
        </View>
      }
    >
      <ScrollView contentContainerStyle={[styles.content, { padding: spacing.md }]}>
        {/* Success Icon & Banner */}
        <View style={styles.successHeader}>
          <View
            style={[
              styles.successCircle,
              {
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderColor: colors.accent,
                borderRadius: borderRadius.full,
              },
            ]}
          >
            <Text style={{ fontSize: 40 }}>✓</Text>
          </View>
          <Text
            style={[
              styles.successTitle,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.xxl,
                fontWeight: typography.fontWeights.heavy,
                marginTop: spacing.md,
              },
            ]}
          >
            Vehicle Returned!
          </Text>
          <Text
            style={[
              styles.successSubtitle,
              {
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
                textAlign: 'center',
                marginTop: 4,
              },
            ]}
          >
            Your rental for booking <Text style={{ color: colors.primary, fontWeight: '700' }}>{booking.id}</Text> has been successfully completed and locked at the mobility hub.
          </Text>
        </View>

        {/* Vehicle Card */}
        <Card
          variant="elevated"
          padding="small"
          style={[
            styles.vehicleCard,
            {
              borderColor: colors.accent,
              borderRadius: borderRadius.md,
              marginTop: spacing.lg,
            },
          ]}
        >
          <Image
            source={{ uri: vehicle.image }}
            style={[styles.vehicleThumb, { borderRadius: borderRadius.md }]}
            resizeMode="cover"
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.statusPill}>
              <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '800' }}>
                ● COMPLETED
              </Text>
            </View>
            <Text
              numberOfLines={1}
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: '700',
                marginTop: 2,
              }}
            >
              {vehicle.brand} {vehicle.model}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs }}>
              Return Location: {booking.returnLocation}
            </Text>
          </View>
        </Card>

        {/* Return Summary Checklist */}
        <Card
          variant="elevated"
          padding="medium"
          style={{
            borderColor: colors.border,
            borderRadius: borderRadius.md,
            marginTop: spacing.md,
          }}
        >
          <View style={styles.summaryItem}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>🔒</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' }}>
                Vehicle Keyless Lock Engaged
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 1 }}>
                Immobilizer and security sensors successfully armed.
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 10 }]} />

          <View style={styles.summaryItem}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>📋</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' }}>
                Inspection Complete
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 1 }}>
                5-point check recorded and attached to booking records.
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 10 }]} />

          <View style={styles.summaryItem}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>💳</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' }}>
                Security Deposit Refund
              </Text>
              <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '600', marginTop: 1 }}>
                Refund initiated back to your {booking.paymentMethod}.
              </Text>
            </View>
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
  successHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successCircle: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  successTitle: {
    letterSpacing: -0.4,
  },
  successSubtitle: {
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  vehicleThumb: {
    width: 80,
    height: 60,
    backgroundColor: '#0F172A',
  },
  statusPill: {
    alignSelf: 'flex-start',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
});
