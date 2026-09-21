import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { FleetManagerStackParamList, MaintenanceRecord, MaintenanceStatus } from '../../types';
import { useTheme } from '../../theme';
import { useFleet } from '../../context/FleetContext';
import { ScreenContainer, Header, Card, Button, EmptyState } from '../../components/common';

type FleetMaintenanceNavProp = NativeStackNavigationProp<
  FleetManagerStackParamList,
  'FleetMaintenance'
>;
type FleetMaintenanceRouteProp = RouteProp<
  FleetManagerStackParamList,
  'FleetMaintenance'
>;

interface Props {
  navigation: FleetMaintenanceNavProp;
  route: FleetMaintenanceRouteProp;
}

const TABS: (MaintenanceStatus | 'All')[] = [
  'All',
  'Scheduled',
  'In Progress',
  'Completed',
  'Overdue',
];

export const FleetMaintenanceScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { maintenanceList, updateMaintenanceStatus } = useFleet();

  const initialFilter = route.params?.filterStatus || 'All';
  const [activeTab, setActiveTab] = useState<MaintenanceStatus | 'All'>(initialFilter);

  const filteredList = maintenanceList.filter(m => {
    if (activeTab === 'All') return true;
    return m.status === activeTab;
  });

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case 'Completed':
        return colors.accent;
      case 'In Progress':
        return colors.primary;
      case 'Scheduled':
        return '#8B5CF6';
      case 'Overdue':
      default:
        return colors.danger;
    }
  };

  const handleStartService = async (item: MaintenanceRecord) => {
    try {
      await updateMaintenanceStatus(item.id, 'In Progress');
      Alert.alert('Service Started', `${item.vehicleName} work order marked "In Progress". Vehicle routed to Maintenance.`);
    } catch (err: any) {
      Alert.alert('Error', err?.message);
    }
  };

  const handleCompleteService = (item: MaintenanceRecord) => {
    Alert.alert(
      'Complete Service Order',
      `Confirm completion of ${item.type} for ${item.vehicleName}? This will return vehicle status to Available.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Completed',
          onPress: async () => {
            try {
              await updateMaintenanceStatus(item.id, 'Completed', item.estimatedCost);
              Alert.alert('Service Complete', 'Maintenance closed and vehicle returned to Available fleet.');
            } catch (err: any) {
              Alert.alert('Error', err?.message);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: MaintenanceRecord }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <Card
        variant="elevated"
        padding="medium"
        style={[styles.recordCard, { borderColor: colors.border }]}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm + 1, fontWeight: '700' }}>
              {item.type}
            </Text>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600', marginTop: 1 }}>
              {item.vehicleName} {item.vehiclePlate ? `(${item.vehiclePlate})` : ''}
            </Text>
          </View>
          <View
            style={[
              styles.statusTag,
              { backgroundColor: `${statusColor}20`, borderColor: statusColor, borderRadius: borderRadius.xs },
            ]}
          >
            <Text style={{ color: statusColor, fontSize: 10, fontWeight: '800' }}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={[styles.metaRow, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm }]}>
          <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
            📅 Due: {item.dueDate}
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>
            Est: ${item.estimatedCost}
          </Text>
        </View>

        <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 6 }}>
          Service Center: {item.serviceCenter}
        </Text>

        {item.notes ? (
          <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4, fontStyle: 'italic' }}>
            "{item.notes}"
          </Text>
        ) : null}

        {/* Action buttons */}
        <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
          {item.status === 'Scheduled' || item.status === 'Overdue' ? (
            <TouchableOpacity
              onPress={() => handleStartService(item)}
              style={[styles.actBtn, { backgroundColor: 'rgba(0, 229, 255, 0.15)', borderRadius: borderRadius.sm }]}
            >
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>
                Start Service
              </Text>
            </TouchableOpacity>
          ) : null}

          {item.status === 'In Progress' ? (
            <TouchableOpacity
              onPress={() => handleCompleteService(item)}
              style={[styles.actBtn, { backgroundColor: colors.accent, borderRadius: borderRadius.sm }]}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
                Complete Service
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
          title="Maintenance Work Orders"
          subtitle={`${maintenanceList.length} Scheduled & Active Services`}
          showBack
          onBackPress={() => navigation.goBack()}
          rightElement={
            <Button
              title="+ Schedule"
              size="small"
              variant="primary"
              onPress={() => navigation.navigate('ScheduleMaintenance')}
            />
          }
        />
      }
    >
      <View style={[styles.tabsWrapper, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TABS}
          keyExtractor={item => item}
          contentContainerStyle={styles.tabsRow}
          renderItem={({ item }) => {
            const isSelected = activeTab === item;
            const count =
              item === 'All'
                ? maintenanceList.length
                : maintenanceList.filter(m => m.status === item).length;
            return (
              <TouchableOpacity
                onPress={() => setActiveTab(item)}
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
        data={filteredList}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { padding: spacing.md }]}
        ListEmptyComponent={
          <EmptyState
            title="No Maintenance Orders"
            message={`No records found under "${activeTab}".`}
            actionTitle="Schedule Service"
            onAction={() => navigation.navigate('ScheduleMaintenance')}
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
  tabsRow: {
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
  recordCard: {
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  actBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
});
