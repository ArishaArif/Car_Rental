import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../types';
import { useTheme } from '../../../theme';
import { useBooking } from '../../../context/BookingContext';
import { ScreenContainer, Header, Card, Button, EmptyState } from '../../../components/common';
import { BookingProgress } from '../../../components/booking';

type BookingSummaryNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'BookingSummary'
>;
type BookingSummaryRouteProp = RouteProp<CustomerStackParamList, 'BookingSummary'>;

interface BookingSummaryProps {
  navigation: BookingSummaryNavProp;
  route: BookingSummaryRouteProp;
}

export const BookingSummaryScreen: React.FC<BookingSummaryProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { vehicleId } = route.params;
  const { draft } = useBooking();

  if (!draft) {
    return (
      <ScreenContainer
        header={
          <Header
            title="Booking Summary"
            showBack
            onBackPress={() => navigation.goBack()}
          />
        }
      >
        <EmptyState
          title="No Active Booking Draft"
          message="Please select a vehicle to review booking details."
          actionTitle="Select Vehicle"
          onAction={() => navigation.navigate('CustomerHome')}
        />
      </ScreenContainer>
    );
  }

  const { vehicle, pricing, rentalDays, pickupDate, pickupTime, returnDate, returnTime, pickupLocation, returnLocation } = draft;

  const handleContinue = () => {
    navigation.navigate('CustomerDetails', { vehicleId });
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Booking Summary"
          subtitle="Review itinerary & pricing breakdown"
          showBack
          onBackPress={() => navigation.goBack()}
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
          <View style={styles.footerCol}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs, fontWeight: '600' }}>
              TOTAL PAYABLE
            </Text>
            <View style={styles.footerPriceRow}>
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
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs - 1, marginLeft: 4 }}>
                incl. deposit
              </Text>
            </View>
          </View>

          <Button
            title="Enter Driver Details →"
            variant="primary"
            size="large"
            onPress={handleContinue}
            style={{ flex: 1, marginLeft: 16 }}
          />
        </View>
      }
    >
      <BookingProgress currentStep="summary" />

      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Vehicle Mini Card */}
        <Card
          variant="elevated"
          padding="small"
          style={[styles.vehicleCard, { borderColor: colors.border }]}
        >
          <Image
            source={{ uri: vehicle.image }}
            style={[styles.vehicleThumb, { borderRadius: borderRadius.md }]}
            resizeMode="cover"
          />
          <View style={styles.vehicleInfo}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.primary,
                    borderRadius: borderRadius.xs,
                  },
                ]}
              >
                <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800' }}>
                  {vehicle.category.toUpperCase()}
                </Text>
              </View>
              <Text style={{ color: colors.warning, fontSize: typography.fontSizes.xs }}>
                ★ {vehicle.rating.toFixed(2)}
              </Text>
            </View>

            <Text
              numberOfLines={1}
              style={[
                styles.vehicleTitle,
                {
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.md,
                  fontWeight: typography.fontWeights.bold,
                },
              ]}
            >
              {vehicle.brand} {vehicle.model}
            </Text>

            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs }}>
              {vehicle.year} · {vehicle.transmission} · {vehicle.fuel} · {vehicle.seats} Seats
            </Text>
          </View>
        </Card>

        {/* Schedule & Route Card */}
        <Card
          variant="elevated"
          padding="medium"
          style={[styles.scheduleCard, { borderColor: colors.border, marginTop: spacing.md }]}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm + 1, fontWeight: '700' }}>
              Rental Schedule & Hubs
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('RentalDates', { vehicleId })}>
              <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs, fontWeight: '700' }}>
                EDIT
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.scheduleContent, { marginTop: spacing.sm }]}>
            {/* Pickup */}
            <View style={styles.routeItem}>
              <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs, fontWeight: '600' }}>
                  PICKUP · {pickupDate} ({pickupTime})
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '600', marginTop: 1 }}>
                  {pickupLocation}
                </Text>
              </View>
            </View>

            {/* Connecting line with duration */}
            <View style={styles.connectingLineWrapper}>
              <View style={[styles.verticalLine, { backgroundColor: colors.border }]} />
              <View
                style={[
                  styles.durationBadge,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                    borderRadius: borderRadius.xs,
                  },
                ]}
              >
                <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>
                  ⏱️ {rentalDays} {rentalDays === 1 ? 'DAY' : 'DAYS'} RENTAL
                </Text>
              </View>
            </View>

            {/* Return */}
            <View style={styles.routeItem}>
              <View style={[styles.routeDot, { backgroundColor: colors.accent }]} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs, fontWeight: '600' }}>
                  RETURN · {returnDate} ({returnTime})
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '600', marginTop: 1 }}>
                  {returnLocation}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Itemized Price Breakdown */}
        <Text
          style={[
            styles.sectionHeading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
              marginBottom: spacing.xs,
            },
          ]}
        >
          Itemized Price Breakdown
        </Text>

        <Card
          variant="elevated"
          padding="medium"
          style={[styles.pricingCard, { borderColor: colors.border }]}
        >
          {/* Daily rate & subtotal */}
          <View style={styles.priceRow}>
            <View>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm }}>
                Vehicle Rental Subtotal
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs - 1 }}>
                ${pricing.dailyPrice} × {pricing.rentalDays} {pricing.rentalDays === 1 ? 'day' : 'days'}
              </Text>
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '700' }}>
              ${pricing.subtotal}
            </Text>
          </View>

          {/* Service fee */}
          <View style={[styles.priceRow, { marginTop: spacing.sm }]}>
            <View>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm }}>
                Velox Service & Platform Fee
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs - 1 }}>
                24/7 Roadside dispatch & platform coverage (10%)
              </Text>
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '700' }}>
              ${pricing.serviceFee}
            </Text>
          </View>

          {/* Taxes */}
          <View style={[styles.priceRow, { marginTop: spacing.sm }]}>
            <View>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm }}>
                Government Sales Tax (VAT)
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs - 1 }}>
                Provincial mobility surcharges (5%)
              </Text>
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '700' }}>
              ${pricing.taxes}
            </Text>
          </View>

          {/* Refundable Security Deposit */}
          <View style={[styles.priceRow, { marginTop: spacing.sm }]}>
            <View>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm }}>
                Refundable Security Deposit
              </Text>
              <Text style={{ color: colors.accent, fontSize: typography.fontSizes.xs - 1, fontWeight: '600' }}>
                ✓ 100% Refundable upon vehicle return
              </Text>
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '700' }}>
              ${pricing.securityDeposit}
            </Text>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: spacing.md }]} />

          {/* Total */}
          <View style={styles.totalRow}>
            <View>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.md,
                  fontWeight: typography.fontWeights.heavy,
                }}
              >
                Total Due
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>
                All taxes and refundable deposit included
              </Text>
            </View>
            <Text
              style={[
                styles.totalValue,
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
        </Card>

        {/* Protection Policies */}
        <Card
          variant="flat"
          padding="medium"
          style={[styles.policyCard, { borderColor: colors.border, marginTop: spacing.md }]}
        >
          <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700', marginBottom: 4 }}>
            📋 Rental Policies & Fuel Rules
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, lineHeight: 18 }}>
            • <Text style={{ fontWeight: '600' }}>Fuel Policy:</Text> Same-to-same. Return with the same level as pickup.
            {'\n'}• <Text style={{ fontWeight: '600' }}>Free Cancellation:</Text> Up to 24 hours prior to pickup.
            {'\n'}• <Text style={{ fontWeight: '600' }}>Mileage:</Text> Unlimited highway & city mileage included.
          </Text>
        </Card>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  vehicleThumb: {
    width: 90,
    height: 70,
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  vehicleTitle: {
    letterSpacing: -0.2,
    marginVertical: 2,
  },
  scheduleCard: {
    borderWidth: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleContent: {
    position: 'relative',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  connectingLineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingLeft: 5,
  },
  verticalLine: {
    width: 2,
    height: 28,
  },
  durationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    marginLeft: 14,
  },
  sectionHeading: {
    letterSpacing: -0.2,
  },
  pricingCard: {
    borderWidth: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  divider: {
    height: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalValue: {
    letterSpacing: -0.5,
  },
  policyCard: {
    borderWidth: 1,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  footerCol: {
    justifyContent: 'center',
  },
  footerPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  footerPrice: {
    letterSpacing: -0.5,
  },
});
