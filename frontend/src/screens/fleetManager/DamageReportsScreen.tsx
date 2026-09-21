import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { DamageReport, DamageReviewStatus, FleetManagerStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { useFleet } from '../../context/FleetContext';
import { ScreenContainer, Header, Card, Button, EmptyState } from '../../components/common';

type DamageReportsNavProp = NativeStackNavigationProp<
  FleetManagerStackParamList,
  'DamageReports'
>;
type DamageReportsRouteProp = RouteProp<
  FleetManagerStackParamList,
  'DamageReports'
>;

interface Props {
  navigation: DamageReportsNavProp;
  route: DamageReportsRouteProp;
}

const TABS: (DamageReviewStatus | 'All')[] = [
  'All',
  'Pending Review',
  'Approved',
  'Disputed',
  'Resolved',
];

export const DamageReportsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { damageReports, resolveDamageReport } = useFleet();

  const initialTab = route.params?.filterStatus || 'All';
  const [activeTab, setActiveTab] = useState<DamageReviewStatus | 'All'>(initialTab);

  const filteredReports = damageReports.filter(d => {
    if (activeTab === 'All') return true;
    return d.reviewStatus === activeTab;
  });

  const getStatusColor = (status: DamageReviewStatus) => {
    switch (status) {
      case 'Resolved':
        return colors.accent;
      case 'Approved':
        return colors.warning;
      case 'Disputed':
        return colors.danger;
      case 'Pending Review':
      default:
        return '#8B5CF6';
    }
  };

  const handleApprove = async (report: DamageReport) => {
    try {
      await resolveDamageReport(report.id, 'Approved', 'Charge confirmed against security deposit.');
      Alert.alert('Report Approved', `Charge of $${report.estimatedCharge} approved.`);
    } catch (err: any) {
      Alert.alert('Error', err?.message);
    }
  };

  const handleResolve = async (report: DamageReport) => {
    try {
      await resolveDamageReport(report.id, 'Resolved', 'Repair completed & closed.');
      Alert.alert('Incident Resolved', `Damage report ${report.id} marked resolved.`);
    } catch (err: any) {
      Alert.alert('Error', err?.message);
    }
  };

  const renderReportCard = ({ item }: { item: DamageReport }) => {
    const statusColor = getStatusColor(item.reviewStatus);

    return (
      <Card
        variant="elevated"
        padding="medium"
        style={[styles.reportCard, { borderColor: colors.border }]}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm + 1, fontWeight: '700' }}>
              {item.damageStatus}
            </Text>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600', marginTop: 1 }}>
              {item.vehicleName} • Booking: {item.bookingId}
            </Text>
          </View>
          <View
            style={[
              styles.statusTag,
              { backgroundColor: `${statusColor}20`, borderColor: statusColor, borderRadius: borderRadius.xs },
            ]}
          >
            <Text style={{ color: statusColor, fontSize: 10, fontWeight: '800' }}>
              {item.reviewStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={[styles.amountStrip, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm }]}>
          <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
            Renter: {item.customerName}
          </Text>
          <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '800' }}>
            Est. Charge: ${item.estimatedCharge}
          </Text>
        </View>

        <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 8 }}>
          {item.description}
        </Text>

        {item.reviewStatus === 'Pending Review' ? (
          <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => handleApprove(item)}
              style={[styles.btn, { backgroundColor: colors.warning, borderRadius: borderRadius.sm }]}
            >
              <Text style={{ color: '#0F172A', fontSize: 11, fontWeight: '800' }}>
                Approve Charge
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleResolve(item)}
              style={[styles.btn, { backgroundColor: colors.accent, borderRadius: borderRadius.sm }]}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
                Waive & Resolve
              </Text>
            </TouchableOpacity>
          </View>
        ) : item.reviewStatus === 'Approved' ? (
          <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => handleResolve(item)}
              style={[styles.btn, { backgroundColor: colors.accent, borderRadius: borderRadius.sm }]}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
                Mark Repaired & Resolved
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
          title="Damage Reports"
          subtitle={`${damageReports.length} Incident Records`}
          showBack
          onBackPress={() => navigation.goBack()}
          rightElement={
            <Button
              title="+ File"
              size="small"
              variant="primary"
              onPress={() => navigation.navigate('NewDamageReport')}
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
                ? damageReports.length
                : damageReports.filter(d => d.reviewStatus === item).length;
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
        data={filteredReports}
        keyExtractor={item => item.id}
        renderItem={renderReportCard}
        contentContainerStyle={[styles.listContent, { padding: spacing.md }]}
        ListEmptyComponent={
          <EmptyState
            title="No Damage Reports"
            message={`No incident reports under status "${activeTab}".`}
            actionTitle="File Damage Report"
            onAction={() => navigation.navigate('NewDamageReport')}
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
  reportCard: {
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
  amountStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});
