import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { FleetManagerStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { useFleet } from '../../context/FleetContext';
import { ScreenContainer, Header, Card, Button } from '../../components/common';

type FleetManagerVehicleDetailsNavProp = NativeStackNavigationProp<
  FleetManagerStackParamList,
  'FleetManagerVehicleDetails'
>;
type FleetManagerVehicleDetailsRouteProp = RouteProp<
  FleetManagerStackParamList,
  'FleetManagerVehicleDetails'
>;

interface Props {
  navigation: FleetManagerVehicleDetailsNavProp;
  route: FleetManagerVehicleDetailsRouteProp;
}

export const FleetManagerVehicleDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { vehicleId } = route.params;
  const { vehicles, maintenanceList, inspectionsList, damageReports } = useFleet();

  const vehicle = vehicles.find(v => v.id === vehicleId);

  const vehicleMaintenance = maintenanceList.filter(m => m.vehicleId === vehicleId);
  const vehicleInspections = inspectionsList.filter(i => i.vehicleId === vehicleId);
  const vehicleDamages = damageReports.filter(d => d.vehicleId === vehicleId);

  if (!vehicle) {
    return (
      <ScreenContainer
        header={<Header title="Vehicle Not Found" showBack onBackPress={() => navigation.goBack()} />}
      >
        <View style={{ padding: spacing.xl, alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Vehicle could not be located.</Text>
          <Button title="Back" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title={`${vehicle.brand} ${vehicle.model}`}
          subtitle={`Fleet ID: ${vehicle.id}`}
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
          <View style={styles.footerBtnRow}>
            <Button
              title="Schedule Service"
              variant="outline"
              size="medium"
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('ScheduleMaintenance', { vehicleId: vehicle.id })}
            />
            <Button
              title="New Inspection"
              variant="primary"
              size="medium"
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('NewInspection', { vehicleId: vehicle.id })}
            />
          </View>
        </View>
      }
    >
      <View style={styles.container}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: vehicle.image }} style={styles.bannerImage} resizeMode="cover" />
          <View
            style={[
              styles.statusTag,
              {
                backgroundColor:
                  vehicle.availability === 'Available'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : vehicle.availability === 'Active Rental'
                    ? 'rgba(0, 229, 255, 0.2)'
                    : 'rgba(245, 158, 11, 0.2)',
                borderColor:
                  vehicle.availability === 'Available'
                    ? colors.accent
                    : vehicle.availability === 'Active Rental'
                    ? colors.primary
                    : colors.warning,
                borderRadius: borderRadius.xs,
              },
            ]}
          >
            <Text
              style={{
                color:
                  vehicle.availability === 'Available'
                    ? colors.accent
                    : vehicle.availability === 'Active Rental'
                    ? colors.primary
                    : colors.warning,
                fontSize: 11,
                fontWeight: '800',
              }}
            >
              ● {vehicle.availability.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={[styles.content, { padding: spacing.md }]}>
          {/* Telematics Bar */}
          <Card variant="elevated" padding="medium" style={styles.telemCard}>
            <View style={styles.telemItem}>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>ODOMETER</Text>
              <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '800' }}>
                {vehicle.mileage?.toLocaleString() || '15,000'} km
              </Text>
            </View>
            <View style={styles.dividerV} />
            <View style={styles.telemItem}>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>FUEL STATUS</Text>
              <Text style={{ color: colors.accent, fontSize: 15, fontWeight: '800' }}>
                100% Full
              </Text>
            </View>
            <View style={styles.dividerV} />
            <View style={styles.telemItem}>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>DEPOT</Text>
              <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }} numberOfLines={1}>
                {vehicle.location.split('-')[0]}
              </Text>
            </View>
          </Card>

          {/* Quick Ops Actions Bar */}
          <View style={styles.quickOpsRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ScheduleMaintenance', { vehicleId: vehicle.id })}
              style={[styles.quickOpBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={{ fontSize: 16, marginBottom: 2 }}>🛠️</Text>
              <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>Service</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('NewInspection', { vehicleId: vehicle.id })}
              style={[styles.quickOpBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={{ fontSize: 16, marginBottom: 2 }}>📋</Text>
              <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>Inspect</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('NewDamageReport', { vehicleId: vehicle.id })}
              style={[styles.quickOpBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={{ fontSize: 16, marginBottom: 2 }}>⚠️</Text>
              <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>Damage</Text>
            </TouchableOpacity>
          </View>

          {/* Maintenance History */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.md }]}>
              Maintenance Log ({vehicleMaintenance.length})
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ScheduleMaintenance', { vehicleId: vehicle.id })}
            >
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>+ Add Log</Text>
            </TouchableOpacity>
          </View>

          {vehicleMaintenance.length > 0 ? (
            vehicleMaintenance.map(m => (
              <Card key={m.id} variant="flat" padding="medium" style={styles.logCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700' }}>
                    {m.type}
                  </Text>
                  <Text
                    style={{
                      color: m.status === 'Completed' ? colors.accent : colors.warning,
                      fontSize: 10,
                      fontWeight: '800',
                    }}
                  >
                    {m.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                  Due: {m.dueDate} • Center: {m.serviceCenter} • Est: ${m.estimatedCost}
                </Text>
                {m.notes ? (
                  <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 4 }}>
                    Note: {m.notes}
                  </Text>
                ) : null}
              </Card>
            ))
          ) : (
            <Text style={{ color: colors.textMuted, fontSize: 12, fontStyle: 'italic', marginBottom: 10 }}>
              No scheduled maintenance records for this vehicle.
            </Text>
          )}

          {/* Inspections History */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.md }]}>
              Inspection Checklist Logs ({vehicleInspections.length})
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('NewInspection', { vehicleId: vehicle.id })}
            >
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>+ Inspect</Text>
            </TouchableOpacity>
          </View>

          {vehicleInspections.length > 0 ? (
            vehicleInspections.map(i => (
              <Card key={i.id} variant="flat" padding="medium" style={styles.logCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700' }}>
                    {i.type} Inspection ({i.date})
                  </Text>
                  <Text
                    style={{
                      color: i.passed ? colors.accent : colors.danger,
                      fontSize: 10,
                      fontWeight: '800',
                    }}
                  >
                    {i.passed ? 'PASSED' : 'FAILED'}
                  </Text>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                  Inspector: {i.inspectorName} • Exterior: {i.exteriorCondition} • Interior: {i.interiorCondition}
                </Text>
              </Card>
            ))
          ) : (
            <Text style={{ color: colors.textMuted, fontSize: 12, fontStyle: 'italic', marginBottom: 10 }}>
              No inspection records filed yet.
            </Text>
          )}

          {/* Damage Incident History */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.md }]}>
              Damage Incident Reports ({vehicleDamages.length})
            </Text>
          </View>

          {vehicleDamages.length > 0 ? (
            vehicleDamages.map(d => (
              <Card key={d.id} variant="flat" padding="medium" style={[styles.logCard, { borderColor: colors.danger }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700' }}>
                    {d.damageStatus} (${d.estimatedCharge})
                  </Text>
                  <Text style={{ color: colors.danger, fontSize: 10, fontWeight: '800' }}>
                    {d.reviewStatus.toUpperCase()}
                  </Text>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                  {d.description}
                </Text>
              </Card>
            ))
          ) : (
            <Text style={{ color: colors.textMuted, fontSize: 12, fontStyle: 'italic' }}>
              Clean record — No active damage claims filed for this vehicle.
            </Text>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
  },
  content: {
    paddingTop: 12,
  },
  bannerContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  statusTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  telemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  telemItem: {
    flex: 1,
    alignItems: 'center',
  },
  dividerV: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  quickOpsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  quickOpBtn: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 6,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  logCard: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  footerBar: {
    borderTopWidth: 1,
  },
  footerBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
