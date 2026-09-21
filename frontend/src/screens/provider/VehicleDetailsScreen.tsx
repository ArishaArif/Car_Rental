import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ProviderStackParamList, VehicleAvailability } from '../../types';
import { useTheme } from '../../theme';
import { useFleet } from '../../context/FleetContext';
import { ScreenContainer, Header, Card, Button } from '../../components/common';

type VehicleDetailsNavProp = NativeStackNavigationProp<
  ProviderStackParamList,
  'VehicleDetails'
>;
type VehicleDetailsRouteProp = RouteProp<ProviderStackParamList, 'VehicleDetails'>;

interface Props {
  navigation: VehicleDetailsNavProp;
  route: VehicleDetailsRouteProp;
}

export const VehicleDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { vehicleId } = route.params;
  const {
    vehicles,
    publishVehicle,
    unpublishVehicle,
    archiveVehicle,
    setAvailability,
  } = useFleet();

  const vehicle = vehicles.find(v => v.id === vehicleId);

  if (!vehicle) {
    return (
      <ScreenContainer
        header={
          <Header
            title="Vehicle Not Found"
            showBack
            onBackPress={() => navigation.goBack()}
          />
        }
      >
        <View style={{ padding: spacing.xl, alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>
            Vehicle with ID {vehicleId} could not be located in your fleet.
          </Text>
          <Button
            title="Back to Fleet"
            onPress={() => navigation.goBack()}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </ScreenContainer>
    );
  }

  const isPublished = vehicle.isPublished !== false && vehicle.availability !== 'Archived';

  const handleTogglePublish = async () => {
    if (isPublished) {
      await unpublishVehicle(vehicle.id);
      Alert.alert('Unpublished', `${vehicle.brand} ${vehicle.model} is now hidden from customer discovery.`);
    } else {
      await publishVehicle(vehicle.id);
      Alert.alert('Published', `${vehicle.brand} ${vehicle.model} is now live and discoverable for customer booking!`);
    }
  };

  const handleArchive = () => {
    Alert.alert(
      'Archive Vehicle',
      `Are you sure you want to archive ${vehicle.brand} ${vehicle.model}? It will be withdrawn from discovery.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            await archiveVehicle(vehicle.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getStatusColor = (status: VehicleAvailability) => {
    switch (status) {
      case 'Available':
        return colors.accent;
      case 'Active Rental':
      case 'Rented':
        return colors.primary;
      case 'Booked':
      case 'Reserved':
        return '#8B5CF6';
      case 'Maintenance':
        return colors.warning;
      case 'Archived':
      default:
        return colors.danger;
    }
  };

  const statusColor = getStatusColor(vehicle.availability);

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title={`${vehicle.brand} ${vehicle.model}`}
          subtitle={`${vehicle.year} • ${vehicle.category}`}
          showBack
          onBackPress={() => navigation.goBack()}
          rightElement={
            <Button
              title="Edit"
              size="small"
              variant="outline"
              onPress={() => navigation.navigate('EditVehicle', { vehicleId: vehicle.id })}
            />
          }
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
          <View style={styles.footerBtnRow}>
            <Button
              title={isPublished ? 'Unpublish' : 'Publish to Renter App'}
              variant={isPublished ? 'secondary' : 'primary'}
              size="medium"
              style={{ flex: 1 }}
              onPress={handleTogglePublish}
            />
            <Button
              title="Change Status"
              variant="outline"
              size="medium"
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('VehicleAvailability', { vehicleId: vehicle.id })}
            />
          </View>
        </View>
      }
    >
      <View style={styles.container}>
        {/* Vehicle Main Banner */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: vehicle.image }} style={styles.bannerImage} resizeMode="cover" />
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: `${statusColor}22`,
                borderColor: statusColor,
                borderRadius: borderRadius.xs,
              },
            ]}
          >
            <Text style={{ color: statusColor, fontSize: 11, fontWeight: '800' }}>
              ● {vehicle.availability.toUpperCase()}
            </Text>
          </View>

          <View
            style={[
              styles.publishPill,
              {
                backgroundColor: isPublished ? 'rgba(16, 185, 129, 0.9)' : 'rgba(100, 116, 139, 0.9)',
                borderRadius: borderRadius.xs,
              },
            ]}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>
              {isPublished ? 'DISCOVERABLE' : 'UNPUBLISHED DRAFT'}
            </Text>
          </View>
        </View>

        <View style={[styles.content, { padding: spacing.md }]}>
          {/* Rate and Deposit Card */}
          <Card variant="elevated" padding="medium" style={styles.pricingCard}>
            <View style={styles.priceCol}>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs }}>
                Daily Rate
              </Text>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: typography.fontSizes.xxl,
                  fontWeight: typography.fontWeights.heavy,
                }}
              >
                ${vehicle.pricePerDay}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>standard 24h</Text>
            </View>

            <View style={styles.dividerV} />

            <View style={styles.priceCol}>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs }}>
                Weekly Rate
              </Text>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.xl,
                  fontWeight: typography.fontWeights.bold,
                }}
              >
                ${vehicle.weeklyPrice || Math.round(vehicle.pricePerDay * 6.2)}
              </Text>
              <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '700' }}>
                save ~12%
              </Text>
            </View>

            <View style={styles.dividerV} />

            <View style={styles.priceCol}>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs }}>
                Security Deposit
              </Text>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.xl,
                  fontWeight: typography.fontWeights.bold,
                }}
              >
                ${vehicle.securityDeposit || 200}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>refundable</Text>
            </View>
          </Card>

          {/* Key Specifications Grid */}
          <Text
            style={[
              styles.sectionHeading,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: typography.fontWeights.bold,
                marginTop: spacing.md,
              },
            ]}
          >
            Vehicle Specifications
          </Text>

          <View style={styles.specsGrid}>
            <View
              style={[
                styles.specTile,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md },
              ]}
            >
              <Text style={styles.specIcon}>📅</Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>Model Year</Text>
              <Text style={[styles.specVal, { color: colors.textPrimary }]}>{vehicle.year}</Text>
            </View>

            <View
              style={[
                styles.specTile,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md },
              ]}
            >
              <Text style={styles.specIcon}>🏷️</Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>Category</Text>
              <Text style={[styles.specVal, { color: colors.textPrimary }]}>{vehicle.category}</Text>
            </View>

            <View
              style={[
                styles.specTile,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md },
              ]}
            >
              <Text style={styles.specIcon}>⚙️</Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>Transmission</Text>
              <Text style={[styles.specVal, { color: colors.textPrimary }]}>{vehicle.transmission}</Text>
            </View>

            <View
              style={[
                styles.specTile,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md },
              ]}
            >
              <Text style={styles.specIcon}>⛽</Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>Fuel Type</Text>
              <Text style={[styles.specVal, { color: colors.textPrimary }]}>{vehicle.fuel}</Text>
            </View>

            <View
              style={[
                styles.specTile,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md },
              ]}
            >
              <Text style={styles.specIcon}>💺</Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>Seating</Text>
              <Text style={[styles.specVal, { color: colors.textPrimary }]}>{vehicle.seats} Seats</Text>
            </View>

            <View
              style={[
                styles.specTile,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md },
              ]}
            >
              <Text style={styles.specIcon}>🚪</Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>Doors</Text>
              <Text style={[styles.specVal, { color: colors.textPrimary }]}>{vehicle.doors} Doors</Text>
            </View>

            <View
              style={[
                styles.specTile,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md },
              ]}
            >
              <Text style={styles.specIcon}>⏱️</Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>Odometer</Text>
              <Text style={[styles.specVal, { color: colors.textPrimary }]}>
                {vehicle.mileage?.toLocaleString() || '15,000'} km
              </Text>
            </View>

            <View
              style={[
                styles.specTile,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md },
              ]}
            >
              <Text style={styles.specIcon}>⭐</Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>Rating</Text>
              <Text style={[styles.specVal, { color: colors.textPrimary }]}>★ {vehicle.rating.toFixed(2)}</Text>
            </View>
          </View>

          {/* Location Depot */}
          <Card variant="flat" padding="medium" style={[styles.locationCard, { marginTop: spacing.md }]}>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, fontWeight: '700' }}>
              📍 ASSIGNED FLEET HUB / LOCATION
            </Text>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: typography.fontWeights.bold,
                marginTop: 4,
              }}
            >
              {vehicle.location}
            </Text>
          </Card>

          {/* Features List */}
          <Text
            style={[
              styles.sectionHeading,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: typography.fontWeights.bold,
                marginTop: spacing.lg,
              },
            ]}
          >
            Equipped Features ({vehicle.features.length})
          </Text>

          <View style={styles.featuresPillsContainer}>
            {vehicle.features.map((feat, idx) => (
              <View
                key={idx}
                style={[
                  styles.featurePill,
                  { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.full },
                ]}
              >
                <Text style={{ color: colors.primary, fontSize: 12, marginRight: 6 }}>✓</Text>
                <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs }}>
                  {feat}
                </Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <Text
            style={[
              styles.sectionHeading,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: typography.fontWeights.bold,
                marginTop: spacing.lg,
              },
            ]}
          >
            Vehicle Description
          </Text>

          <Card variant="flat" padding="medium" style={{ marginTop: spacing.xs }}>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.sm, lineHeight: 20 }}>
              {vehicle.description}
            </Text>
          </Card>

          {/* Management Actions */}
          <Text
            style={[
              styles.sectionHeading,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: typography.fontWeights.bold,
                marginTop: spacing.lg,
              },
            ]}
          >
            Fleet Controls
          </Text>

          <View style={[styles.dangerBox, { marginTop: spacing.xs }]}>
            <Button
              title="Archive Vehicle from Active Fleet"
              variant="danger"
              size="medium"
              fullWidth
              onPress={handleArchive}
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  bannerContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  statusPill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  publishPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  content: {
    paddingTop: 12,
  },
  pricingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  priceCol: {
    flex: 1,
    alignItems: 'center',
  },
  dividerV: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  sectionHeading: {
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specTile: {
    width: '23%',
    flexGrow: 1,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
  },
  specIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  specVal: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  locationCard: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  featuresPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dangerBox: {
    marginTop: 8,
  },
  footerBar: {
    borderTopWidth: 1,
  },
  footerBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
