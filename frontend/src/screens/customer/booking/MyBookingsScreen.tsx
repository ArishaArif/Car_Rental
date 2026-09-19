import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList, BookingStatus } from '../../../types';
import { useTheme } from '../../../theme';
import { useBooking } from '../../../context/BookingContext';
import { ScreenContainer, Header, Card, EmptyState } from '../../../components/common';

type MyBookingsNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'MyBookings'
>;

interface MyBookingsProps {
  navigation: MyBookingsNavProp;
}

type TabFilter = 'all' | 'upcoming' | 'completed';

export const MyBookingsScreen: React.FC<MyBookingsProps> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { bookings } = useBooking();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'upcoming') {
      return b.status === 'Confirmed' || b.status === 'Active';
    }
    if (activeTab === 'completed') {
      return b.status === 'Completed' || b.status === 'Cancelled';
    }
    return true;
  });

  const getStatusBadgeStyle = (status: BookingStatus) => {
    switch (status) {
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
      {/* Filter Tabs */}
      <View
        style={[
          styles.tabsBar,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('all')}
          style={[
            styles.tabBtn,
            {
              backgroundColor: activeTab === 'all' ? colors.primary : colors.surfaceVariant,
              borderRadius: borderRadius.md,
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
          onPress={() => setActiveTab('upcoming')}
          style={[
            styles.tabBtn,
            {
              backgroundColor: activeTab === 'upcoming' ? colors.primary : colors.surfaceVariant,
              borderRadius: borderRadius.md,
              marginHorizontal: 8,
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
            Active & Upcoming ({bookings.filter(b => b.status === 'Confirmed' || b.status === 'Active').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('completed')}
          style={[
            styles.tabBtn,
            {
              backgroundColor: activeTab === 'completed' ? colors.primary : colors.surfaceVariant,
              borderRadius: borderRadius.md,
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
            Past ({bookings.filter(b => b.status === 'Completed' || b.status === 'Cancelled').length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { padding: spacing.md }]}>
        {filteredBookings.length === 0 ? (
          <EmptyState
            title="No Bookings in this View"
            message="You don't have any reservations matching this filter. Explore our curated fleet to book your next ride."
            actionTitle="Discover Fleet"
            onAction={() => navigation.navigate('VehicleGallery')}
            style={{ marginTop: 40 }}
          />
        ) : (
          filteredBookings.map(item => {
            const badge = getStatusBadgeStyle(item.status);
            return (
              <Card
                key={item.id}
                variant="elevated"
                padding="none"
                style={[
                  styles.bookingCard,
                  {
                    borderColor: colors.border,
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
                      <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs - 1, marginTop: 2 }}>
                        📍 {item.pickupLocation}
                      </Text>
                    </View>
                  </View>

                  {/* Card Bottom Row: Total & Action */}
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
                        TOTAL PAID
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

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('BookingDetails', { bookingId: item.id })}
                      style={[
                        styles.viewBtn,
                        {
                          backgroundColor: 'rgba(0, 229, 255, 0.12)',
                          borderColor: colors.primary,
                          borderRadius: borderRadius.sm,
                        },
                      ]}
                    >
                      <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs, fontWeight: '700' }}>
                        VIEW VOUCHER →
                      </Text>
                    </TouchableOpacity>
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
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabBtn: {
    paddingHorizontal: 12,
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
  viewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
});
