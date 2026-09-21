import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme';
import { Vehicle } from '../../types';

interface VehicleChatCardProps {
  vehicle: Vehicle;
  onSelect: (vehicleId: string) => void;
}

export const VehicleChatCard: React.FC<VehicleChatCardProps> = ({ vehicle, onSelect }) => {
  const { colors, typography, borderRadius } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onSelect(vehicle.id)}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: borderRadius.md,
        },
      ]}
    >
      <Image
        source={{ uri: vehicle.image }}
        style={[styles.thumbnail, { borderTopLeftRadius: borderRadius.md, borderBottomLeftRadius: borderRadius.md }]}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.modelText,
              { fontSize: typography.fontSizes.sm, color: colors.textPrimary },
            ]}
            numberOfLines={1}
          >
            {vehicle.brand} {vehicle.model}
          </Text>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: colors.primary + '18' },
            ]}
          >
            <Text style={[styles.categoryText, { color: colors.primary }]}>
              {vehicle.category}
            </Text>
          </View>
        </View>

        <View style={styles.specRow}>
          <Text style={[styles.specText, { color: colors.textSecondary }]}>
            {vehicle.transmission} • {vehicle.seats} Seats • {vehicle.fuel}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View>
            <Text style={[styles.priceAmount, { color: colors.primary }]}>
              PKR {vehicle.pricePerDay.toLocaleString()}
            </Text>
            <Text style={[styles.perDay, { color: colors.textSecondary }]}>
              / day
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.bookBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.sm }]}
            onPress={() => onSelect(vehicle.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.bookBtnText}>Select & Book →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    flexDirection: 'row',
    borderWidth: 1,
    marginRight: 12,
    marginVertical: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnail: {
    width: 95,
    height: '100%',
    minHeight: 105,
    backgroundColor: '#E2E8F0',
  },
  content: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  modelText: {
    fontWeight: '700',
    flex: 1,
    marginRight: 4,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  specRow: {
    marginBottom: 6,
  },
  specText: {
    fontSize: 11,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  priceAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  perDay: {
    fontSize: 10,
  },
  bookBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
