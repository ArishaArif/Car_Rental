import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList, Booking, BookingStatus } from '../../types';
import { useTheme } from '../../theme';
import { useBooking } from '../../context/BookingContext';
import { ScreenContainer, Header, Card, Input, Button } from '../../components/common';

type AdminBookingsNavProp = NativeStackNavigationProp<AdminStackParamList, 'AdminBookings'>;
type AdminBookingsRouteProp = RouteProp<AdminStackParamList, 'AdminBookings'>;

interface Props {
  navigation: AdminBookingsNavProp;
  route: AdminBookingsRouteProp;
}

export const AdminBookingsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { bookings } = useBooking();
  const initialTab = route.params?.initialFilter || 'All';
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'All'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = selectedStatus === 'All' || b.status === selectedStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.id.toLowerCase().includes(q) ||
      b.customer.fullName.toLowerCase().includes(q) ||
      b.vehicle.brand.toLowerCase().includes(q) ||
      b.vehicle.model.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadgeStyle = (status: BookingStatus) => {
    switch (status) {
      case 'Active':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', border: '#3B82F6' };
      case 'Confirmed':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: colors.success || '#10B981', border: '#10B981' };
      case 'Completed':
        return { bg: 'rgba(107, 114, 128, 0.15)', text: colors.textSecondary, border: colors.border };
      case 'Cancelled':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: colors.danger, border: colors.danger };
      case 'Pending':
      default:
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#D97706', border: '#F59E0B' };
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Reservation Oversight"
          subtitle={`${filteredBookings.length} booking records`}
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Search */}
        <Input
          placeholder="Search by booking ID, customer or vehicle..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchContainer}
        />

        {/* Status Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContainer}
        >
          {(['All', 'Active', 'Confirmed', 'Pending', 'Completed', 'Cancelled'] as const).map(
            tab => {
              const isSelected = selectedStatus === tab;
              const count =
                tab === 'All'
                  ? bookings.length
                  : bookings.filter(b => b.status === tab).length;

              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.8}
                  onPress={() => setSelectedStatus(tab)}
                  style={[
                    styles.tabButton,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: borderRadius.md,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: isSelected ? colors.textInverse : colors.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {tab} ({count})
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </ScrollView>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card variant="flat" padding="large" style={styles.emptyCard}>
            <Text style={{ fontSize: 32, textAlign: 'center' }}>📑</Text>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: '700',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              No Bookings Found
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.xs,
                textAlign: 'center',
                marginTop: 4,
              }}
            >
              No reservation records match the chosen search query or status filter.
            </Text>
          </Card>
        ) : (
          filteredBookings.map(item => {
            const badge = getStatusBadgeStyle(item.status);

            return (
              <Card
                key={item.id}
                variant="elevated"
                padding="medium"
                style={styles.bookingCard}
                onPress={() => setSelectedBooking(item)}
              >
                {/* Header: ID & Status */}
                <View style={styles.headerRow}>
                  <View>
                    <Text
                      style={[
                        styles.bookingId,
                        {
                          color: colors.primary,
                          fontSize: typography.fontSizes.sm,
                          fontWeight: '800',
                        },
                      ]}
                    >
                      {item.id}
                    </Text>
                    <Text
                      style={[
                        styles.customerName,
                        {
                          color: colors.textPrimary,
                          fontSize: typography.fontSizes.sm,
                          fontWeight: '700',
                          marginTop: 2,
                        },
                      ]}
                    >
                      👤 {item.customer.fullName}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: badge.bg, borderColor: badge.border },
                    ]}
                  >
                    <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Vehicle & Date Information */}
                <View style={styles.infoRow}>
                  <Text style={[styles.vehicleText, { color: colors.textPrimary }]}>
                    🚗 {item.vehicle.year} {item.vehicle.brand} {item.vehicle.model}
                  </Text>
                  <Text style={[styles.datesText, { color: colors.textSecondary }]}>
                    📅 {item.pickupDate} → {item.returnDate} ({item.rentalDays} Days)
                  </Text>
                  <Text style={[styles.locationText, { color: colors.textMuted }]}>
                    📍 {item.pickupLocation}
                  </Text>
                </View>

                {/* Bottom Row: Amount & Details CTA */}
                <View style={[styles.bottomRow, { borderTopColor: colors.border }]}>
                  <View>
                    <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
                      Gross Rental Total
                    </Text>
                    <Text
                      style={[
                        styles.amountVal,
                        { color: colors.success || '#10B981', fontWeight: '800' },
                      ]}
                    >
                      ${item.pricing.total} USD
                    </Text>
                  </View>

                  <Button
                    title="View Details"
                    variant="outline"
                    size="small"
                    onPress={() => setSelectedBooking(item)}
                  />
                </View>
              </Card>
            );
          })
        )}

        {/* Detailed Booking Modal */}
        <Modal
          visible={Boolean(selectedBooking)}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedBooking(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.surface, borderRadius: borderRadius.xl }]}>
              {selectedBooking && (
                <>
                  <View style={styles.modalHeader}>
                    <View>
                      <Text
                        style={[
                          styles.modalTitle,
                          {
                            color: colors.textPrimary,
                            fontSize: typography.fontSizes.lg,
                            fontWeight: typography.fontWeights.bold,
                          },
                        ]}
                      >
                        Booking Dossier
                      </Text>
                      <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>
                        {selectedBooking.id} • Pickup Code: {selectedBooking.pickupCode}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setSelectedBooking(null)}
                      style={[styles.closeBtn, { backgroundColor: colors.surfaceVariant }]}
                    >
                      <Text style={{ fontSize: 16, color: colors.textPrimary }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
                    {/* Vehicle Block */}
                    <Text style={[styles.subHeading, { color: colors.textPrimary }]}>
                      Vehicle Asset
                    </Text>
                    <View style={styles.specRow}>
                      <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Asset:</Text>
                      <Text style={[styles.specValue, { color: colors.textPrimary, fontWeight: '700' }]}>
                        {selectedBooking.vehicle.year} {selectedBooking.vehicle.brand} {selectedBooking.vehicle.model}
                      </Text>
                    </View>
                    <View style={styles.specRow}>
                      <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Category:</Text>
                      <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                        {selectedBooking.vehicle.category} ({selectedBooking.vehicle.fuel})
                      </Text>
                    </View>

                    {/* Customer Block */}
                    <Text style={[styles.subHeading, { color: colors.textPrimary, marginTop: 12 }]}>
                      Renter Information
                    </Text>
                    <View style={styles.specRow}>
                      <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Customer:</Text>
                      <Text style={[styles.specValue, { color: colors.textPrimary, fontWeight: '700' }]}>
                        {selectedBooking.customer.fullName}
                      </Text>
                    </View>
                    <View style={styles.specRow}>
                      <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Email:</Text>
                      <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                        {selectedBooking.customer.email}
                      </Text>
                    </View>
                    <View style={styles.specRow}>
                      <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Phone:</Text>
                      <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                        {selectedBooking.customer.phone}
                      </Text>
                    </View>
                    <View style={styles.specRow}>
                      <Text style={[styles.specLabel, { color: colors.textSecondary }]}>License:</Text>
                      <Text style={[styles.specValue, { color: colors.accent, fontWeight: '700' }]}>
                        {selectedBooking.customer.licenseNumber}
                      </Text>
                    </View>

                    {/* Timeline */}
                    <Text style={[styles.subHeading, { color: colors.textPrimary, marginTop: 12 }]}>
                      Rental Schedule
                    </Text>
                    <View style={styles.specRow}>
                      <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Pickup:</Text>
                      <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                        {selectedBooking.pickupDate} at {selectedBooking.pickupTime}
                      </Text>
                    </View>
                    <View style={styles.specRow}>
                      <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Return:</Text>
                      <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                        {selectedBooking.returnDate} at {selectedBooking.returnTime}
                      </Text>
                    </View>
                    <View style={styles.specRow}>
                      <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Depot:</Text>
                      <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                        {selectedBooking.pickupLocation}
                      </Text>
                    </View>

                    {/* Pricing Breakdown */}
                    <Text style={[styles.subHeading, { color: colors.textPrimary, marginTop: 12 }]}>
                      Financial Breakdown
                    </Text>
                    <View style={styles.specRow}>
                      <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Daily Rate:</Text>
                      <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                        ${selectedBooking.pricing.dailyPrice} x {selectedBooking.pricing.rentalDays} Days
                      </Text>
                    </View>
                    <View style={styles.specRow}>
                      <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Service Fee:</Text>
                      <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                        ${selectedBooking.pricing.serviceFee}
                      </Text>
                    </View>
                    <View style={styles.specRow}>
                      <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Security Deposit:</Text>
                      <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                        ${selectedBooking.pricing.securityDeposit}
                      </Text>
                    </View>
                    <View style={[styles.specRow, { borderBottomWidth: 0 }]}>
                      <Text style={[styles.specLabel, { color: colors.textPrimary, fontWeight: '800' }]}>
                        Total Charged:
                      </Text>
                      <Text style={[styles.specValue, { color: colors.success || '#10B981', fontWeight: '800' }]}>
                        ${selectedBooking.pricing.total} USD
                      </Text>
                    </View>
                  </ScrollView>

                  <View style={styles.modalFooter}>
                    <Button
                      title="Close Dossier"
                      variant="primary"
                      size="medium"
                      onPress={() => setSelectedBooking(null)}
                    />
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  searchContainer: {
    marginBottom: 12,
  },
  tabScrollContainer: {
    gap: 8,
    paddingBottom: 12,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 11,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  bookingCard: {
    marginBottom: 14,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingId: {
    letterSpacing: 0.5,
  },
  customerName: {
    letterSpacing: -0.2,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  infoRow: {
    marginTop: 10,
    marginBottom: 10,
    gap: 3,
  },
  vehicleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  datesText: {
    fontSize: 11,
  },
  locationText: {
    fontSize: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 0.5,
  },
  amountLabel: {
    fontSize: 10,
  },
  amountVal: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitle: {
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollBody: {
    marginBottom: 14,
  },
  subHeading: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  specLabel: {
    fontSize: 11,
  },
  specValue: {
    fontSize: 11,
    maxWidth: '65%',
    textAlign: 'right',
  },
  modalFooter: {
    marginTop: 4,
  },
});
