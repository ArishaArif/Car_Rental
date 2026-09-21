import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { FleetInspection, FleetManagerStackParamList, InspectionStatus } from '../../types';
import { useTheme } from '../../theme';
import { useFleet } from '../../context/FleetContext';
import { ScreenContainer, Header, Card, Button, EmptyState } from '../../components/common';

type FleetInspectionsNavProp = NativeStackNavigationProp<
  FleetManagerStackParamList,
  'FleetInspections'
>;
type FleetInspectionsRouteProp = RouteProp<
  FleetManagerStackParamList,
  'FleetInspections'
>;

interface Props {
  navigation: FleetInspectionsNavProp;
  route: FleetInspectionsRouteProp;
}

const TABS: (InspectionStatus | 'All')[] = [
  'All',
  'Pending',
  'In Progress',
  'Completed',
  'Failed',
];

export const FleetInspectionsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { inspectionsList, updateInspection } = useFleet();

  const initialTab = route.params?.filterStatus || 'All';
  const [activeTab, setActiveTab] = useState<InspectionStatus | 'All'>(initialTab);

  const filteredList = inspectionsList.filter(i => {
    if (activeTab === 'All') return true;
    return i.status === activeTab;
  });

  const getStatusColor = (status: InspectionStatus) => {
    switch (status) {
      case 'Completed':
        return colors.accent;
      case 'In Progress':
        return colors.primary;
      case 'Pending':
        return '#8B5CF6';
      case 'Failed':
      default:
        return colors.danger;
    }
  };

  const handlePassInspection = async (item: FleetInspection) => {
    try {
      await updateInspection(item.id, {
        status: 'Completed',
        passed: true,
      });
      Alert.alert('Passed', `${item.vehicleName} inspection certified PASSED.`);
    } catch (err: any) {
      Alert.alert('Error', err?.message);
    }
  };

  const renderItem = ({ item }: { item: FleetInspection }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <Card
        variant="elevated"
        padding="medium"
        style={[styles.itemCard, { borderColor: colors.border }]}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm + 1, fontWeight: '700' }}>
              {item.type} Checklist
            </Text>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600', marginTop: 1 }}>
              {item.vehicleName}
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

        {/* Checklist breakdown */}
        <View style={[styles.checkGrid, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm }]}>
          <View style={styles.checkItem}>
            <Text style={{ color: colors.textMuted, fontSize: 9 }}>EXTERIOR</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>
              {item.exteriorCondition}
            </Text>
          </View>
          <View style={styles.dividerV} />
          <View style={styles.checkItem}>
            <Text style={{ color: colors.textMuted, fontSize: 9 }}>INTERIOR</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>
              {item.interiorCondition}
            </Text>
          </View>
          <View style={styles.dividerV} />
          <View style={styles.checkItem}>
            <Text style={{ color: colors.textMuted, fontSize: 9 }}>TIRES & BRAKES</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>
              {item.tiresAndBrakes}
            </Text>
          </View>
        </View>

        <View style={styles.infoFooter}>
          <Text style={{ color: colors.textMuted, fontSize: 10 }}>
            Inspector: {item.inspectorName} • Date: {item.date} • Fuel: {item.fuelLevel}%
          </Text>
          <Text
            style={{
              color: item.passed ? colors.accent : colors.danger,
              fontSize: 11,
              fontWeight: '800',
            }}
          >
            {item.passed ? '✓ PASSED' : '✕ FAILED'}
          </Text>
        </View>

        {item.status === 'In Progress' || item.status === 'Pending' ? (
          <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => handlePassInspection(item)}
              style={[styles.actBtn, { backgroundColor: colors.accent, borderRadius: borderRadius.sm }]}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
                Certify & Pass
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </Card>
    );
  };

  return (
    <ScreenContainer
      header={
        <Header
          title="Vehicle Inspections"
          subtitle={`${inspectionsList.length} Technical Audits Logged`}
          showBack
          onBackPress={() => navigation.goBack()}
          rightElement={
            <Button
              title="+ New"
              size="small"
              variant="primary"
              onPress={() => navigation.navigate('NewInspection')}
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
                ? inspectionsList.length
                : inspectionsList.filter(i => i.status === item).length;
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
            title="No Inspections Found"
            message={`No inspections under status "${activeTab}".`}
            actionTitle="Perform Inspection"
            onAction={() => navigation.navigate('NewInspection')}
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
  itemCard: {
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  checkGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    marginTop: 8,
  },
  checkItem: {
    flex: 1,
    alignItems: 'center',
  },
  dividerV: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  infoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  actBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
});
