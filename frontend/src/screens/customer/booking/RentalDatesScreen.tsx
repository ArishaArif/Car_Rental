import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../types';
import { useTheme } from '../../../theme';
import { useBooking } from '../../../context/BookingContext';
import { ScreenContainer, Header, Card, Button } from '../../../components/common';
import { BookingProgress, CalendarPicker } from '../../../components/booking';

type RentalDatesNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'RentalDates'
>;
type RentalDatesRouteProp = RouteProp<CustomerStackParamList, 'RentalDates'>;

interface RentalDatesProps {
  navigation: RentalDatesNavProp;
  route: RentalDatesRouteProp;
}

const TIME_SLOTS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '04:00 PM',
  '06:00 PM',
  '08:00 PM',
];

export const RentalDatesScreen: React.FC<RentalDatesProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { vehicleId } = route.params;
  const { draft, setDates } = useBooking();

  // Local state initialized from draft
  const [pickupDate, setPickupDate] = useState<string>(draft?.pickupDate || '');
  const [returnDate, setReturnDate] = useState<string>(draft?.returnDate || '');
  const [pickupTime, setPickupTime] = useState<string>(draft?.pickupTime || '10:00 AM');
  const [returnTime, setReturnTime] = useState<string>(draft?.returnTime || '10:00 AM');

  // Calculate duration and validate
  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 1;
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    if (e < s) return -1; // Invalid
    if (e === s) return 1; // Same-day rental counts as 1 day minimum
    const diffTime = e - s;
    return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  };

  const rentalDays = calculateDays(pickupDate, returnDate);
  const isInvalidRange = rentalDays === -1;
  const isValid = !isInvalidRange && pickupDate !== '' && returnDate !== '';

  const handleRangeSelected = (start: string, end: string) => {
    setPickupDate(start);
    setReturnDate(end);
  };

  // Quick preset helper
  const applyPreset = (daysCount: number) => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + 1);

    const end = new Date(start);
    end.setDate(start.getDate() + daysCount);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    setPickupDate(startStr);
    setReturnDate(endStr);
  };

  const handleContinue = () => {
    if (!isValid) return;
    const finalDays = Math.max(1, rentalDays);
    setDates(pickupDate, pickupTime, returnDate, returnTime, finalDays);
    navigation.navigate('RentalLocation', { vehicleId });
  };

  // Pricing calculation
  const dailyPrice = draft?.vehicle.pricePerDay || 50;
  const estimatedSubtotal = dailyPrice * Math.max(1, rentalDays);

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Select Rental Dates"
          subtitle={draft ? `${draft.vehicle.brand} ${draft.vehicle.model}` : 'Choose schedule'}
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
          <View style={styles.footerPriceCol}>
            <Text style={[styles.footerLabel, { color: colors.textMuted, fontSize: typography.fontSizes.xs }]}>
              ESTIMATED SUB-TOTAL
            </Text>
            <View style={styles.footerPriceRow}>
              <Text
                style={[
                  styles.footerPrice,
                  {
                    color: colors.primary,
                    fontSize: typography.fontSizes.xl,
                    fontWeight: typography.fontWeights.heavy,
                  },
                ]}
              >
                ${isValid ? estimatedSubtotal : '--'}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs }}>
                {' '}for {isValid ? rentalDays : 0} {rentalDays === 1 ? 'day' : 'days'}
              </Text>
            </View>
          </View>

          <Button
            title="Choose Locations →"
            variant="primary"
            size="large"
            disabled={!isValid}
            onPress={handleContinue}
            style={{ flex: 1, marginLeft: 16 }}
          />
        </View>
      }
    >
      <BookingProgress currentStep="dates" />

      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Selected Dates Highlight Banner */}
        <Card
          variant="elevated"
          padding="medium"
          style={[
            styles.selectionBanner,
            {
              backgroundColor: isInvalidRange ? 'rgba(239, 68, 68, 0.1)' : colors.surface,
              borderColor: isInvalidRange ? colors.danger : colors.primary,
            },
          ]}
        >
          <View style={styles.bannerRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs, fontWeight: '700' }}>
                PICKUP DATE
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.md, fontWeight: 'bold', marginTop: 2 }}>
                {pickupDate || 'Select on calendar'}
              </Text>
              <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
                ⏰ {pickupTime}
              </Text>
            </View>

            <View style={styles.durationBadgeContainer}>
              <View
                style={[
                  styles.durationPill,
                  {
                    backgroundColor: isInvalidRange ? colors.danger : colors.primary,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Text
                  style={{
                    color: colors.textInverse,
                    fontSize: typography.fontSizes.xs,
                    fontWeight: '800',
                  }}
                >
                  {isInvalidRange ? 'INVALID' : `${rentalDays} ${rentalDays === 1 ? 'DAY' : 'DAYS'}`}
                </Text>
              </View>
              <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs - 2, marginTop: 4 }}>
                {rentalDays > 0 ? `${rentalDays * 24} hrs` : ''}
              </Text>
            </View>

            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs, fontWeight: '700' }}>
                RETURN DATE
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.md, fontWeight: 'bold', marginTop: 2 }}>
                {returnDate || 'Select on calendar'}
              </Text>
              <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
                ⏰ {returnTime}
              </Text>
            </View>
          </View>

          {isInvalidRange ? (
            <View style={[styles.errorBox, { borderColor: colors.danger, marginTop: spacing.sm }]}>
              <Text style={{ color: colors.danger, fontSize: typography.fontSizes.xs, fontWeight: '600' }}>
                ⚠️ Return date cannot be earlier than pickup date. Please pick a valid end date.
              </Text>
            </View>
          ) : null}
        </Card>

        {/* Quick Presets */}
        <Text
          style={[
            styles.subheading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.sm,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.md,
              marginBottom: spacing.xs,
            },
          ]}
        >
          Quick Presets
        </Text>

        <View style={styles.presetsRow}>
          <TouchableOpacity
            onPress={() => applyPreset(1)}
            style={[
              styles.presetChip,
              {
                backgroundColor: rentalDays === 1 ? colors.primary : colors.surfaceVariant,
                borderColor: colors.border,
                borderRadius: borderRadius.sm,
              },
            ]}
          >
            <Text
              style={{
                color: rentalDays === 1 ? colors.textInverse : colors.textPrimary,
                fontSize: typography.fontSizes.xs,
                fontWeight: '700',
              }}
            >
              1 Day
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => applyPreset(3)}
            style={[
              styles.presetChip,
              {
                backgroundColor: rentalDays === 3 ? colors.primary : colors.surfaceVariant,
                borderColor: colors.border,
                borderRadius: borderRadius.sm,
              },
            ]}
          >
            <Text
              style={{
                color: rentalDays === 3 ? colors.textInverse : colors.textPrimary,
                fontSize: typography.fontSizes.xs,
                fontWeight: '700',
              }}
            >
              3 Days (Popular)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => applyPreset(2)}
            style={[
              styles.presetChip,
              {
                backgroundColor: rentalDays === 2 ? colors.primary : colors.surfaceVariant,
                borderColor: colors.border,
                borderRadius: borderRadius.sm,
              },
            ]}
          >
            <Text
              style={{
                color: rentalDays === 2 ? colors.textInverse : colors.textPrimary,
                fontSize: typography.fontSizes.xs,
                fontWeight: '700',
              }}
            >
              Weekend
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => applyPreset(7)}
            style={[
              styles.presetChip,
              {
                backgroundColor: rentalDays === 7 ? colors.primary : colors.surfaceVariant,
                borderColor: colors.border,
                borderRadius: borderRadius.sm,
              },
            ]}
          >
            <Text
              style={{
                color: rentalDays === 7 ? colors.textInverse : colors.textPrimary,
                fontSize: typography.fontSizes.xs,
                fontWeight: '700',
              }}
            >
              1 Week
            </Text>
          </TouchableOpacity>
        </View>

        {/* Interactive Calendar */}
        <Text
          style={[
            styles.subheading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.sm,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.md,
            },
          ]}
        >
          Select Dates on Calendar
        </Text>

        <CalendarPicker
          startDate={pickupDate}
          endDate={returnDate}
          onSelectRange={handleRangeSelected}
        />

        {/* Pickup Time Slots */}
        <Text
          style={[
            styles.subheading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.sm,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.md,
              marginBottom: spacing.xs,
            },
          ]}
        >
          Pickup Time
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
          {TIME_SLOTS.map(t => (
            <TouchableOpacity
              key={`pickup-${t}`}
              onPress={() => setPickupTime(t)}
              style={[
                styles.timeChip,
                {
                  backgroundColor: pickupTime === t ? colors.primary : colors.surfaceVariant,
                  borderColor: colors.border,
                  borderRadius: borderRadius.sm,
                },
              ]}
            >
              <Text
                style={{
                  color: pickupTime === t ? colors.textInverse : colors.textSecondary,
                  fontSize: typography.fontSizes.xs,
                  fontWeight: pickupTime === t ? '700' : '500',
                }}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Return Time Slots */}
        <Text
          style={[
            styles.subheading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.sm,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.md,
              marginBottom: spacing.xs,
            },
          ]}
        >
          Return Time
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
          {TIME_SLOTS.map(t => (
            <TouchableOpacity
              key={`return-${t}`}
              onPress={() => setReturnTime(t)}
              style={[
                styles.timeChip,
                {
                  backgroundColor: returnTime === t ? colors.primary : colors.surfaceVariant,
                  borderColor: colors.border,
                  borderRadius: borderRadius.sm,
                },
              ]}
            >
              <Text
                style={{
                  color: returnTime === t ? colors.textInverse : colors.textSecondary,
                  fontSize: typography.fontSizes.xs,
                  fontWeight: returnTime === t ? '700' : '500',
                }}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  selectionBanner: {
    borderWidth: 1.5,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationBadgeContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  durationPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  errorBox: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  subheading: {
    letterSpacing: -0.2,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  timeScroll: {
    flexDirection: 'row',
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  footerPriceCol: {
    justifyContent: 'center',
  },
  footerLabel: {
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  footerPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  footerPrice: {
    letterSpacing: -0.5,
  },
});
