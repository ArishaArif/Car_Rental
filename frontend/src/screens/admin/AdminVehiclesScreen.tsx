import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList, Vehicle, VehicleCategory } from '../../types';
import { useTheme } from '../../theme';
import { adminService } from '../../services/adminService';
import { ScreenContainer, Header, Card, Input, Button } from '../../components/common';

type AdminVehiclesNavProp = NativeStackNavigationProp<AdminStackParamList, 'AdminVehicles'>;

interface Props {
  navigation: AdminVehiclesNavProp;
}

export const AdminVehiclesScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [vehicles, setVehicles] = useState<(Vehicle & { isSuspended?: boolean })[]>(
    adminService.getVehicles()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory | 'All'>('All');
  const [selectedVehicle, setSelectedVehicle] = useState<
    (Vehicle & { isSuspended?: boolean }) | null
  >(null);

  useEffect(() => {
    const unsubscribe = adminService.subscribe(() => {
      setVehicles(adminService.getVehicles());
    });
    return unsubscribe;
  }, []);

  const filteredVehicles = vehicles.filter(v => {
    const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      v.brand.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.location.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleToggleSuspension = (v: Vehicle & { isSuspended?: boolean }) => {
    const isNowSuspended = adminService.toggleVehicleSuspension(v.id);
    Alert.alert(
      isNowSuspended ? 'Listing Suspended' : 'Listing Activated',
      `${v.brand} ${v.model} is now ${isNowSuspended ? 'suspended from public customer bookings' : 'active and searchable'}.`
    );
    if (selectedVehicle?.id === v.id) {
      setSelectedVehicle(prev => (prev ? { ...prev, isSuspended: isNowSuspended } : null));
    }
  };

  const getAvailabilityBadge = (v: Vehicle & { isSuspended?: boolean }) => {
    if (v.isSuspended) {
      return { bg: 'rgba(239, 68, 68, 0.15)', text: colors.danger, border: colors.danger, label: 'SUSPENDED' };
    }
    switch (v.availability) {
      case 'Available':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: colors.success || '#10B981', border: '#10B981', label: 'AVAILABLE' };
      case 'Active Rental':
      case 'Rented':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', border: '#3B82F6', label: 'IN RENTAL' };
      case 'Maintenance':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#D97706', border: '#F59E0B', label: 'MAINTENANCE' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', text: colors.textSecondary, border: colors.border, label: v.availability.toUpperCase() };
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Fleet Oversight"
          subtitle={`${filteredVehicles.length} vehicles registered on platform`}
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Search */}
        <Input
          placeholder="Search by brand, model or hub depot..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchContainer}
        />

        {/* Category Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
          contentContainerStyle={styles.tabScrollContainer}
        >
          {(['All', 'Sedan', 'SUV', 'Luxury', 'Economy'] as const).map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat as any)}
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
                    styles.tabButtonText,
                    {
                      color: isSelected ? colors.textInverse : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Vehicles List */}
        {filteredVehicles.length === 0 ? (
          <Card variant="flat" padding="large" style={styles.emptyCard}>
            <Text style={{ fontSize: 32, textAlign: 'center' }}>🚗</Text>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: '700',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              No Vehicles Found
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.xs,
                textAlign: 'center',
                marginTop: 4,
              }}
            >
              No vehicle records match the specified search and filter.
            </Text>
          </Card>
        ) : (
          filteredVehicles.map(vehicle => {
            const badge = getAvailabilityBadge(vehicle);

            return (
              <Card
                key={vehicle.id}
                variant="elevated"
                padding="medium"
                style={[
                  styles.vehicleCard,
                  {
                    borderColor: vehicle.isSuspended ? colors.danger : colors.border,
                  },
                ]}
              >
                <View style={styles.cardTopRow}>
                  {/* Vehicle Image */}
                  <Image source={{ uri: vehicle.image }} style={styles.vehicleThumb} resizeMode="cover" />

                  {/* Title & Category */}
                  <View style={styles.titleInfo}>
                    <Text
                      style={[
                        styles.vehicleName,
                        {
                          color: colors.textPrimary,
                          fontSize: typography.fontSizes.md,
                          fontWeight: typography.fontWeights.bold,
                        },
                      ]}
                    >
                      {vehicle.year} {vehicle.brand} {vehicle.model}
                    </Text>

                    <Text
                      style={[
                        styles.catText,
                        { color: colors.textSecondary, fontSize: typography.fontSizes.xs },
                      ]}
                    >
                      {vehicle.category} • {vehicle.fuel} • {vehicle.transmission}
                    </Text>

                    <Text
                      style={[
                        styles.rateText,
                        { color: colors.primary, fontSize: typography.fontSizes.sm, fontWeight: '800' },
                      ]}
                    >
                      ${vehicle.pricePerDay}
                      <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: '400' }}>
                        {' '}/ day
                      </Text>
                    </Text>
                  </View>

                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: badge.bg, borderColor: badge.border },
                    ]}
                  >
                    <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Sub details: Location, Rating */}
                <View style={styles.metaRow}>
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>
                    📍 {vehicle.location}
                  </Text>
                  <Text style={[styles.metaText, { color: colors.warning, fontWeight: '700' }]}>
                    ★ {vehicle.rating}
                  </Text>
                </View>

                {/* Actions: View Details, Suspend/Activate Listing */}
                <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
                  <Button
                    title="View Specs"
                    variant="outline"
                    size="small"
                    onPress={() => setSelectedVehicle(vehicle)}
                    style={styles.actionBtn}
                  />

                  <Button
                    title={vehicle.isSuspended ? 'Reactivate Listing' : 'Suspend Listing'}
                    variant={vehicle.isSuspended ? 'primary' : 'danger'}
                    size="small"
                    onPress={() => handleToggleSuspension(vehicle)}
                    style={styles.actionBtn}
                  />
                </View>
              </Card>
            );
          })
        )}

        {/* Vehicle Details Modal */}
        <Modal
          visible={Boolean(selectedVehicle)}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedVehicle(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.surface, borderRadius: borderRadius.xl }]}>
              {selectedVehicle && (
                <>
                  <View style={styles.modalHeader}>
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
                      Vehicle Telematics Dossier
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSelectedVehicle(null)}
                      style={[styles.closeBtn, { backgroundColor: colors.surfaceVariant }]}
                    >
                      <Text style={{ fontSize: 16, color: colors.textPrimary }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollBody} contentContainerStyle={styles.modalScrollContent}>
                    <Image source={{ uri: selectedVehicle.image }} style={styles.modalImage} resizeMode="cover" />

                    <View style={styles.modalBody}>
                      <View style={styles.dossierRow}>
                        <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Asset ID</Text>
                        <Text style={[styles.dossierValue, { color: colors.accent, fontWeight: '700' }]}>
                          {selectedVehicle.id}
                        </Text>
                      </View>

                      <View style={styles.dossierRow}>
                        <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Make / Model</Text>
                        <Text style={[styles.dossierValue, { color: colors.textPrimary, fontWeight: '700' }]}>
                          {selectedVehicle.year} {selectedVehicle.brand} {selectedVehicle.model}
                        </Text>
                      </View>

                      <View style={styles.dossierRow}>
                        <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Category</Text>
                        <Text style={[styles.dossierValue, { color: colors.textPrimary }]}>
                          {selectedVehicle.category}
                        </Text>
                      </View>

                      <View style={styles.dossierRow}>
                        <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Daily Rental Base</Text>
                        <Text style={[styles.dossierValue, { color: colors.primary, fontWeight: '800' }]}>
                          ${selectedVehicle.pricePerDay} USD
                        </Text>
                      </View>

                      <View style={styles.dossierRow}>
                        <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Assigned Depot</Text>
                        <Text style={[styles.dossierValue, { color: colors.textPrimary }]}>
                          {selectedVehicle.location}
                        </Text>
                      </View>

                      <View style={styles.dossierRow}>
                        <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Seats & Doors</Text>
                        <Text style={[styles.dossierValue, { color: colors.textPrimary }]}>
                          {selectedVehicle.seats} Seats • {selectedVehicle.doors} Doors
                        </Text>
                      </View>

                      <View style={[styles.dossierRow, { borderBottomWidth: 0 }]}>
                        <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Listing Status</Text>
                        <Text
                          style={[
                            styles.dossierValue,
                            {
                              color: selectedVehicle.isSuspended ? colors.danger : colors.success || '#10B981',
                              fontWeight: '800',
                            },
                          ]}
                        >
                          {selectedVehicle.isSuspended ? 'SUSPENDED FROM PLATFORM' : 'ACTIVE & DISPATCHABLE'}
                        </Text>
                      </View>
                    </View>
                  </ScrollView>

                  <View style={styles.modalFooter}>
                    <Button
                      title={selectedVehicle.isSuspended ? 'Restore to Active Catalog' : 'Suspend Vehicle Listing'}
                      variant={selectedVehicle.isSuspended ? 'primary' : 'danger'}
                      size="medium"
                      onPress={() => handleToggleSuspension(selectedVehicle)}
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
  tabScroll: {
    marginBottom: 16,
  },
  tabScrollContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: 11,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  vehicleCard: {
    marginBottom: 14,
    borderWidth: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  titleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleName: {
    letterSpacing: -0.2,
  },
  catText: {
    marginTop: 2,
  },
  rateText: {
    marginTop: 4,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  metaText: {
    fontSize: 11,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 0.5,
  },
  actionBtn: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  modalImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalScrollBody: {
    flexShrink: 1,
  },
  modalScrollContent: {
    paddingBottom: 4,
  },
  modalBody: {
    marginBottom: 14,
  },
  dossierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  dossierLabel: {
    fontSize: 12,
  },
  dossierValue: {
    fontSize: 12,
    maxWidth: '65%',
    textAlign: 'right',
  },
  modalFooter: {
    marginTop: 4,
  },
});
