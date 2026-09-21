import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Booking, BookingStatus, ProviderStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { useBooking } from '../../context/BookingContext';
import { ScreenContainer, Header, Card, EmptyState } from '../../components/common';

type ProviderBookingsNavProp = NativeStackNavigationProp<
  ProviderStackParamList,
  'ProviderBookings'
>;
type ProviderBookingsRouteProp = RouteProp<
  ProviderStackParamList,
  'ProviderBookings'
>;

interface Props {
  navigation: ProviderBookingsNavProp;
  route: ProviderBookingsRouteProp;
}

const BOOKING_TABS: (BookingStatus | 'All')[] = [
  'All',
  'Pending',
  'Confirmed',
  'Active',
  'Completed',
  'Cancelled',
];

export const ProviderBookingsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const {
    bookings,
    approveBooking,
    rejectBooking,
    markReady,
    startRental,
    completeRental,
  } = useBooking();

  const initialTab = route.params?.initialFilter || 'All';
  const [selectedTab, setSelectedTab] = useState<BookingStatus | 'All'>(initialTab);

  const filteredBookings = bookings.filter(b => {
    if (selectedTab === 'All') return true;
    return b.status === selectedTab;
  });

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'Active':
        return colors.primary;
      case 'Confirmed':
        return colors.accent;
      case 'Pending':
        return colors.warning;
      case 'Completed':
        return '#3B82F6';
      case 'Cancelled':
      default:
        return colors.danger;
    }
  };

  const handleApprove = async (booking: Booking) => {
    try {
      await approveBooking(booking.id);
      Alert.alert('Booking Approved', `Booking ${booking.id} has been confirmed.`);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to approve booking');
    }
  };

  const handleReject = (booking: Booking) => {
    Alert.alert(
      'Reject Booking',
      `Are you sure you want to reject booking ${booking.id} from ${booking.customer.fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject & Refund',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectBooking(booking.id, 'Fleet owner schedule conflict');
            } catch (err: any) {
              Alert.alert('Error', err?.message);
            }
          },
        },
      ]
    );
  };

  const handleMarkReady = async (booking: Booking) => {
    try {
      await markReady(booking.id);
      Alert.alert('Vehicle Ready', `${booking.vehicle.brand} ${booking.vehicle.model} marked ready for customer pickup.`);
    } catch (err: any) {
      Alert.alert('Error', err?.message);
    }
  };

  const handleStartRental = async (booking: Booking) => {
    try {
      await startRental(booking.id);
      Alert.alert(
        'Rental Activated',
        `Rental ${booking.id} is now Active. Key handover completed; vehicle availability set to Active Rental.`
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message);
    }
  };

  const handleCompleteRental = (booking: Booking) => {
    Alert.alert(
      'Complete Rental',
      `Confirm return inspection and finalize booking ${booking.id}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete & Issue Invoice',
          onPress: async () => {
            try {
              await completeRental(booking.id);
              Alert.alert('Rental Completed', 'Vehicle returned to Available fleet and final invoice generated.');
            } catch (err: any) {
              Alert.alert('Error', err?.message);
            }
          },
        },
      ]
    );
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <Card
        variant="elevated"
        padding="medium"
        style={[styles.bookingCard, { borderColor: colors.border }]}
        onPress={() => navigation.navigate('ProviderBookingDetails', { bookingId: item.id })}
      >
        {/* Header: Vehicle & Status */}
        <View style={styles.cardHeader}>
          <Image source={{ uri: item.vehicle.image }} style={styles.thumbnail} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.md,
                  fontWeight: typography.fontWeights.bold,
                  flex: 1,
                }}
              >
                {item.vehicle.brand} {item.vehicle.model}
              </Text>
              <View
                style={[
                  styles.statusTag,
                  {
                    backgroundColor: `${statusColor}22`,
                    borderColor: statusColor,
                    borderRadius: borderRadius.xs,
                  },
                ]}
              >
                <Text style={{ color: statusColor, fontSize: 10, fontWeight: '800' }}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
              ID: {item.id} • {item.rentalDays} Days
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
              👤 Renter: {item.customer.fullName} ({item.customer.phone})
            </Text>
          </View>
        </View>

        {/* Schedule & Financial Breakdown */}
        <View style={[styles.infoStrip, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm }]}>
          <View style={styles.infoCol}>
            <Text style={{ color: colors.textMuted, fontSize: 10 }}>PICKUP</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>
              {item.pickupDate}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 10 }}>{item.pickupTime}</Text>
          </View>

          <View style={styles.stripDivider} />

          <View style={styles.infoCol}>
            <Text style={{ color: colors.textMuted, fontSize: 10 }}>RETURN</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>
              {item.returnDate}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 10 }}>{item.returnTime}</Text>
          </View>

          <View style={styles.stripDivider} />

          <View style={styles.infoCol}>
            <Text style={{ color: colors.textMuted, fontSize: 10 }}>TOTAL REVENUE</Text>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '800' }}>
              ${item.pricing.total}
            </Text>
            <Text style={{ color: colors.accent, fontSize: 9, fontWeight: '700' }}>
              {item.paymentStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Pickup Code and Hub */}
        <View style={styles.metaRow}>
          <Text style={{ color: colors.textMuted, fontSize: 11, flex: 1 }} numberOfLines={1}>
            📍 {item.pickupLocation}
          </Text>
          <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700' }}>
            PIN: {item.pickupCode}
          </Text>
        </View>

        {/* Contextual Action Buttons */}
        <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProviderBookingDetails', { bookingId: item.id })}
            style={[styles.actionBtn, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm }]}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>
              Details
            </Text>
          </TouchableOpacity>

          {item.status === 'Pending' ? (
            <>
              <TouchableOpacity
                onPress={() => handleReject(item)}
                style={[
                  styles.actionBtn,
                  { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: borderRadius.sm },
                ]}
              >
                <Text style={{ color: colors.danger, fontSize: 11, fontWeight: '800' }}>
                  Reject
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleApprove(item)}
                style={[
                  styles.actionBtn,
                  { backgroundColor: colors.primary, borderRadius: borderRadius.sm },
                ]}
              >
                <Text style={{ color: colors.textInverse, fontSize: 11, fontWeight: '800' }}>
                  Approve
                </Text>
              </TouchableOpacity>
            </>
          ) : item.status === 'Confirmed' ? (
            <>
              <TouchableOpacity
                onPress={() => handleMarkReady(item)}
                style={[
                  styles.actionBtn,
                  { backgroundColor: 'rgba(99, 102, 241, 0.15)', borderRadius: borderRadius.sm },
                ]}
              >
                <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '800' }}>
                  Mark Ready
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleStartRental(item)}
                style={[
                  styles.actionBtn,
                  { backgroundColor: colors.primary, borderRadius: borderRadius.sm },
                ]}
              >
                <Text style={{ color: colors.textInverse, fontSize: 11, fontWeight: '800' }}>
                  Start Rental
                </Text>
              </TouchableOpacity>
            </>
          ) : item.status === 'Active' ? (
            <TouchableOpacity
              onPress={() => handleCompleteRental(item)}
              style={[
                styles.actionBtn,
                { backgroundColor: colors.accent, borderRadius: borderRadius.sm },
              ]}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
                Complete Return
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </Card>
    );
  };

  return (
    <ScreenContainer
      header={
        <Header
          title="Reservation Orders"
          subtitle={`${bookings.length} Total Bookings`}
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      {/* Status Filter Tabs */}
      <View style={[styles.tabsWrapper, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={BOOKING_TABS}
          keyExtractor={tab => tab}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => {
            const isSelected = selectedTab === item;
            const count =
              item === 'All' ? bookings.length : bookings.filter(b => b.status === item).length;

            return (
              <TouchableOpacity
                onPress={() => setSelectedTab(item)}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: isSelected ? colors.primary : 'transparent',
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isSelected ? colors.textInverse : colors.textSecondary,
                    fontSize: 12,
                    fontWeight: isSelected ? '700' : '500',
                  }}
                >
                  {item} ({count})
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={item => item.id}
        renderItem={renderBookingCard}
        contentContainerStyle={[styles.listContent, { padding: spacing.md }]}
        ListEmptyComponent={
          <EmptyState
            title="No Bookings in this Category"
            message={`There are currently no bookings with status "${selectedTab}".`}
            actionTitle="View All Bookings"
            onAction={() => setSelectedTab('All')}
          />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  tabsWrapper: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  tabsList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  listContent: {
    paddingBottom: 32,
    gap: 12,
  },
  bookingCard: {
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 70,
    height: 60,
    borderRadius: 8,
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  infoStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    marginTop: 10,
  },
  infoCol: {
    flex: 1,
    alignItems: 'center',
  },
  stripDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
