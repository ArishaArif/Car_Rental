import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList, BookingStatus } from '../../../types';
import { useTheme } from '../../../theme';
import { useBooking } from '../../../context/BookingContext';
import { ScreenContainer, Header, Card, EmptyState } from '../../../components/common';

type MyBookingsNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'MyBookings'
>;
type MyBookingsRouteProp = RouteProp<CustomerStackParamList, 'MyBookings'>;

interface MyBookingsProps {
  navigation: MyBookingsNavProp;
  route?: MyBookingsRouteProp;
}

type TabFilter = 'all' | 'upcoming' | 'active' | 'completed' | 'cancelled';

export const MyBookingsScreen: React.FC<MyBookingsProps> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { bookings, cancelBooking } = useBooking();
  const [activeTab, setActiveTab] = useState<TabFilter>(route?.params?.initialTab || 'all');

  useEffect(() => {
    if (route?.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  const upcomingCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length;
  const activeCount = bookings.filter(b => b.status === 'Active').length;
  const completedCount = bookings.filter(b => b.status === 'Completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'Cancelled').length;

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'upcoming') {
      return b.status === 'Confirmed' || b.status === 'Pending';
    }
    if (activeTab === 'active') {
      return b.status === 'Active';
    }
    if (activeTab === 'completed') {
      return b.status === 'Completed';
    }
    if (activeTab === 'cancelled') {
      return b.status === 'Cancelled';
    }
    return true;
  });

  const getStatusBadgeStyle = (status: BookingStatus) => {
    switch (status) {
      case 'Pending':
        return {
          bg: 'rgba(234, 179, 8, 0.15)',
          border: '#EAB308',
          text: '#EAB308',
        };
      case 'Confirmed':
        return {
          bg: 'rgba(0, 229, 255, 0.15)',
          border: colors.primary,
          text: colors.primary,
        };
      case 'Active':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          border: colors.accent,
          text: colors.accent,
        };
      case 'Completed':
        return {
          bg: colors.surfaceVariant,
          border: colors.border,
          text: colors.textSecondary,
        };
      case 'Cancelled':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          border: colors.danger,
          text: colors.danger,
        };
    }
  };

  const handleCancelBooking = (bookingId: string, amount: number, paymentMethod: string) => {
    Alert.alert(
      'Cancel Booking?',
      `Are you sure you want to cancel booking ${bookingId}? Full refund of $${amount} will be returned to your ${paymentMethod}.`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: async () => {
            const success = await cancelBooking(bookingId);
            if (success) {
              Alert.alert('Booking Cancelled', 'Your reservation was cancelled successfully.');
            }
          },
        },
      ]
    );
  };

  const renderEmptyState = () => {
    switch (activeTab) {
      case 'active':
        return (
          <EmptyState
            title="No Active Rentals"
            message="You don't have any vehicles currently checked out. Browse our fleet to start a rental."
            actionTitle="Discover Fleet"
            onAction={() => navigation.navigate('VehicleGallery')}
            style={{ marginTop: 40 }}
          />
        );
      case 'upcoming':
        return (
          <EmptyState
            title="No Upcoming Bookings"
            message="You have no confirmed or pending reservations scheduled."
            actionTitle="Reserve a Car"
            onAction={() => navigation.navigate('VehicleGallery')}
            style={{ marginTop: 40 }}
          />
        );
      case 'completed':
        return (
          <EmptyState
            title="No Completed Rentals"
            message="Your past completed rental receipts and return vouchers will appear here."
            actionTitle="Find a Vehicle"
            onAction={() => navigation.navigate('VehicleGallery')}
            style={{ marginTop: 40 }}
          />
        );
      case 'cancelled':
        return (
          <EmptyState
            title="No Cancelled Bookings"
            message="You have zero cancelled reservations on file."
            style={{ marginTop: 40 }}
          />
        );
      default:
        return (
          <EmptyState
            title="No Bookings on File"
            message="You haven't reserved any vehicles yet. Explore our curated fleet to book your next ride."
            actionTitle="Discover Fleet"
            onAction={() => navigation.navigate('VehicleGallery')}
            style={{ marginTop: 40 }}
          />
        );
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="My Bookings"
          subtitle={`${bookings.length} reservations on file`}
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      {/* Scrollable Filter Tabs */}
      <View
        style={[
          styles.tabsBar,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
        >
          <TouchableOpacity
            onPress={() => setActiveTab('all')}
            style={[
              styles.tabBtn,
              {
                backgroundColor: activeTab === 'all' ? colors.primary : colors.surfaceVariant,
                borderRadius: borderRadius.md,
                marginRight: 8,
              },
            ]}
          >
            <Text
              style={{
                color: activeTab === 'all' ? colors.textInverse : colors.textSecondary,
                fontSize: typography.fontSizes.xs,
                fontWeight: '700',
              }}
            >
              All ({bookings.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('active')}
            style={[
              styles.tabBtn,
              {
                backgroundColor: activeTab === 'active' ? colors.accent : colors.surfaceVariant,
                borderRadius: borderRadius.md,
                marginRight: 8,
              },
            ]}
          >
            <Text
              style={{
                color: activeTab === 'active' ? '#0F172A' : colors.textSecondary,
                fontSize: typography.fontSizes.xs,
                fontWeight: '700',
              }}
            >
              Active ({activeCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('upcoming')}
            style={[
              styles.tabBtn,
              {
                backgroundColor: activeTab === 'upcoming' ? colors.primary : colors.surfaceVariant,
                borderRadius: borderRadius.md,
                marginRight: 8,
              },
            ]}
          >
            <Text
              style={{
                color: activeTab === 'upcoming' ? colors.textInverse : colors.textSecondary,
                fontSize: typography.fontSizes.xs,
                fontWeight: '700',
              }}
            >
              Upcoming ({upcomingCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('completed')}
            style={[
              styles.tabBtn,
              {
                backgroundColor: activeTab === 'completed' ? colors.primary : colors.surfaceVariant,
                borderRadius: borderRadius.md,
                marginRight: 8,
              },
            ]}
          >
            <Text
              style={{
                color: activeTab === 'completed' ? colors.textInverse : colors.textSecondary,
                fontSize: typography.fontSizes.xs,
                fontWeight: '700',
              }}
            >
              Completed ({completedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('cancelled')}
            style={[
              styles.tabBtn,
              {
                backgroundColor: activeTab === 'cancelled' ? colors.danger : colors.surfaceVariant,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Text
              style={{
                color: activeTab === 'cancelled' ? '#FFFFFF' : colors.textSecondary,
                fontSize: typography.fontSizes.xs,
                fontWeight: '700',
              }}
            >
              Cancelled ({cancelledCount})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { padding: spacing.md }]}>
        {filteredBookings.length === 0 ? (
          renderEmptyState()
        ) : (
          filteredBookings.map(item => {
            const badge = getStatusBadgeStyle(item.status);
            const isEligibleForCancel = item.status === 'Confirmed' || item.status === 'Pending';
            const isActiveRental = item.status === 'Active';
            const isCompleted = item.status === 'Completed';

            return (
              <Card
                key={item.id}
                variant="elevated"
                padding="none"
                style={[
                  styles.bookingCard,
                  {
                    borderColor: isActiveRental ? colors.accent : colors.border,
                    backgroundColor: colors.surface,
                    borderRadius: borderRadius.lg,
                    marginBottom: spacing.md,
                  },
                ]}
              >
                {/* Header: ID + Status */}
                <View
                  style={[
                    styles.cardHeader,
                    {
                      borderBottomColor: colors.border,
                      borderBottomWidth: 1,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                    },
                  ]}
                >
                  <View>
                    <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700' }}>
                      BOOKING ID
                    </Text>
                    <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm, fontWeight: '700' }}>
                      {item.id}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: badge.bg,
                        borderColor: badge.border,
                        borderRadius: borderRadius.xs,
                      },
                    ]}
                  >
                    <Text style={{ color: badge.text, fontSize: 10, fontWeight: '800' }}>
                      ● {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Body: Vehicle & Details */}
                <View style={{ padding: spacing.md }}>
                  <View style={styles.vehicleRow}>
                    <Image
                      source={{ uri: item.vehicle.image }}
                      style={[styles.carThumb, { borderRadius: borderRadius.md }]}
                      resizeMode="cover"
                    />

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800' }}>
                        {item.vehicle.category.toUpperCase()}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={{
                          color: colors.textPrimary,
                          fontSize: typography.fontSizes.md,
                          fontWeight: '700',
                          marginTop: 1,
                        }}
                      >
                        {item.vehicle.brand} {item.vehicle.model}
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
                        📅 {item.pickupDate} → {item.returnDate}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs - 1, marginTop: 2 }}
                      >
                        📍 {item.pickupLocation}
                      </Text>
                    </View>
                  </View>

                  {/* Card Bottom Row: Total & Realistic Contextual Actions */}
                  <View
                    style={[
                      styles.cardBottomRow,
                      {
                        borderTopColor: colors.border,
                        borderTopWidth: 1,
                        marginTop: spacing.md,
                        paddingTop: spacing.sm,
                      },
                    ]}
                  >
                    <View>
                      <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '600' }}>
                        TOTAL AMOUNT
                      </Text>
                      <Text
                        style={{
                          color: colors.primary,
                          fontSize: typography.fontSizes.lg,
                          fontWeight: typography.fontWeights.heavy,
                        }}
                      >
                        ${item.pricing.total}
                      </Text>
                    </View>

                    <View style={styles.actionButtonsRow}>
                      {/* Contextual Action 1 */}
                      {isActiveRental ? (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => navigation.navigate('ActiveRental', { bookingId: item.id })}
                          style={[
                            styles.actionBtn,
                            {
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              borderColor: colors.accent,
                              borderRadius: borderRadius.sm,
                              marginRight: 6,
                            },
                          ]}
                        >
                          <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '800' }}>
                            CONTINUE RENTAL →
                          </Text>
                        </TouchableOpacity>
                      ) : null}

                      {isCompleted ? (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => navigation.navigate('FinalInvoice', { bookingId: item.id })}
                          style={[
                            styles.actionBtn,
                            {
                              backgroundColor: 'rgba(0, 229, 255, 0.12)',
                              borderColor: colors.primary,
                              borderRadius: borderRadius.sm,
                              marginRight: 6,
                            },
                          ]}
                        >
                          <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>
                            VIEW INVOICE 🧾
                          </Text>
                        </TouchableOpacity>
                      ) : null}

                      {isEligibleForCancel ? (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => handleCancelBooking(item.id, item.pricing.total, item.paymentMethod)}
                          style={[
                            styles.actionBtn,
                            {
                              backgroundColor: 'rgba(239, 68, 68, 0.12)',
                              borderColor: colors.danger,
                              borderRadius: borderRadius.sm,
                              marginRight: 6,
                            },
                          ]}
                        >
                          <Text style={{ color: colors.danger, fontSize: 11, fontWeight: '700' }}>
                            CANCEL
                          </Text>
                        </TouchableOpacity>
                      ) : null}

                      {/* Standard View Booking Action */}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('BookingDetails', { bookingId: item.id })}
                        style={[
                          styles.actionBtn,
                          {
                            backgroundColor: colors.surfaceVariant,
                            borderColor: colors.border,
                            borderRadius: borderRadius.sm,
                          },
                        ]}
                      >
                        <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>
                          DETAILS →
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  tabsBar: {
    borderBottomWidth: 1,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  content: {
    paddingBottom: 28,
  },
  bookingCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carThumb: {
    width: 80,
    height: 60,
    backgroundColor: '#0F172A',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
  },
});
