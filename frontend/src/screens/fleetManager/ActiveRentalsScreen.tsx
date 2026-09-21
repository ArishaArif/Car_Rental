import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Booking, FleetManagerStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { useBooking } from '../../context/BookingContext';
import { ScreenContainer, Header, Card, EmptyState, Button } from '../../components/common';

type ActiveRentalsNavProp = NativeStackNavigationProp<
  FleetManagerStackParamList,
  'ActiveRentals'
>;

interface Props {
  navigation: ActiveRentalsNavProp;
}

export const ActiveRentalsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { bookings } = useBooking();

  const activeBookings = bookings.filter(b => b.status === 'Active');

  const handleContactDriver = (booking: Booking) => {
    Alert.alert(
      'Contact Renter',
      `Driver: ${booking.customer.fullName}\nPhone: ${booking.customer.phone}\nEmail: ${booking.customer.email}`,
      [{ text: 'Close' }]
    );
  };

  const renderActiveCard = ({ item }: { item: Booking }) => {
    return (
      <Card
        variant="elevated"
        padding="medium"
        style={[styles.rentalCard, { borderColor: colors.primary }]}
      >
        <View style={styles.cardHeader}>
          <Image source={{ uri: item.vehicle.image }} style={styles.vehicleImg} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.md, fontWeight: '700' }}>
                {item.vehicle.brand} {item.vehicle.model}
              </Text>
              <View
                style={[
                  styles.livePill,
                  { backgroundColor: 'rgba(0, 229, 255, 0.15)', borderRadius: borderRadius.xs },
                ]}
              >
                <Text style={{ color: colors.primary, fontSize: 9, fontWeight: '800' }}>● ON TRIP</Text>
              </View>
            </View>

            <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
              Booking: {item.id} • Key PIN: {item.pickupCode}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4, fontWeight: '600' }}>
              Driver: {item.customer.fullName} ({item.customer.phone})
            </Text>
          </View>
        </View>

        <View style={[styles.scheduleStrip, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm }]}>
          <View style={styles.schedCol}>
            <Text style={{ color: colors.textMuted, fontSize: 10 }}>PICKED UP</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>
              {item.pickupDate}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 10 }}>{item.pickupTime}</Text>
          </View>

          <View style={styles.vDivider} />

          <View style={styles.schedCol}>
            <Text style={{ color: colors.textMuted, fontSize: 10 }}>EXPECTED RETURN</Text>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>
              {item.returnDate}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 10 }}>{item.returnTime}</Text>
          </View>

          <View style={styles.vDivider} />

          <View style={styles.schedCol}>
            <Text style={{ color: colors.textMuted, fontSize: 10 }}>DROP-OFF HUB</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }} numberOfLines={1}>
              {item.returnLocation.split('-')[0]}
            </Text>
          </View>
        </View>

        <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => handleContactDriver(item)}
            style={[styles.actionBtn, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm }]}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>
              📞 Call Driver
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('FleetReturns')}
            style={[styles.actionBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.sm }]}
          >
            <Text style={{ color: colors.textInverse, fontSize: 11, fontWeight: '800' }}>
              Check-In Desk →
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <ScreenContainer
      header={
        <Header
          title="Active On-Road Rentals"
          subtitle={`${activeBookings.length} Vehicles Currently Dispatched`}
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <FlatList
        data={activeBookings}
        keyExtractor={item => item.id}
        renderItem={renderActiveCard}
        contentContainerStyle={[styles.listContent, { padding: spacing.md }]}
        ListEmptyComponent={
          <EmptyState
            title="No Active Rentals"
            message="No fleet vehicles are currently checked out on client trips."
          />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 32,
    gap: 12,
  },
  rentalCard: {
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleImg: {
    width: 75,
    height: 60,
    borderRadius: 6,
  },
  livePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  scheduleStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    marginTop: 10,
  },
  schedCol: {
    flex: 1,
    alignItems: 'center',
  },
  vDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});
