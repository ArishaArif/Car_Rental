import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FleetManagerStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useFleet } from '../../context/FleetContext';
import { useBooking } from '../../context/BookingContext';
import { notificationService } from '../../services/notificationService';
import { ScreenContainer, Header, Card, Button } from '../../components/common';

type FleetManagerDashboardNavProp = NativeStackNavigationProp<
  FleetManagerStackParamList,
  'FleetManagerDashboard'
>;

interface Props {
  navigation: FleetManagerDashboardNavProp;
}

export const FleetManagerDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { user } = useAuth();
  const { getDashboardKPIs, tasks, toggleTask } = useFleet();
  const { bookings } = useBooking();

  const kpis = getDashboardKPIs();
  const pendingTasks = tasks.filter(t => t.status === 'Pending').slice(0, 3);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnread = async () => {
      const count = await notificationService.getUnreadCount('FleetManager');
      setUnreadCount(count);
    };
    loadUnread();

    const unsubscribe = notificationService.subscribe(async () => {
      const count = await notificationService.getUnreadCount('FleetManager');
      setUnreadCount(count);
    });
    return unsubscribe;
  }, []);

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Fleet Operations"
          subtitle={user?.department || 'Austin Hub Control'}
          rightElement={
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() => navigation.navigate('NotificationCenter')}
                style={[
                  styles.profileAvatar,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Text style={{ fontSize: 16 }}>🔔</Text>
                {unreadCount > 0 && (
                  <View
                    style={[
                      styles.unreadBadge,
                      { backgroundColor: colors.danger, borderRadius: borderRadius.full },
                    ]}
                  >
                    <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('FleetManagerProfile')}
                style={[
                  styles.profileAvatar,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.accent,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Text style={{ fontSize: 18 }}>🛠️</Text>
              </TouchableOpacity>
            </View>
          }
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Hub Banner */}
        <View style={styles.hubHeader}>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: typography.fontSizes.xl,
              fontWeight: typography.fontWeights.heavy,
              letterSpacing: -0.3,
            }}
          >
            Daily Operations Center
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
            Active Dispatch, Turnaround & Maintenance Telematics
          </Text>
        </View>

        {/* 6 Core Dashboard KPIs Grid */}
        <View style={styles.kpiGrid}>
          {/* Vehicles */}
          <Card
            variant="elevated"
            padding="medium"
            style={styles.kpiCard}
            onPress={() => navigation.navigate('FleetManagerFleet')}
          >
            <View style={styles.kpiTop}>
              <Text style={{ fontSize: 18 }}>🚘</Text>
              <Text style={[styles.kpiVal, { color: colors.textPrimary }]}>{kpis.vehicles}</Text>
            </View>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Vehicles</Text>
            <Text style={{ color: colors.primary, fontSize: 10, marginTop: 4, fontWeight: '700' }}>
              Fleet spec →
            </Text>
          </Card>

          {/* Available */}
          <Card
            variant="elevated"
            padding="medium"
            style={styles.kpiCard}
            onPress={() => navigation.navigate('FleetManagerFleet', { filterStatus: 'Available' })}
          >
            <View style={styles.kpiTop}>
              <Text style={{ fontSize: 18 }}>✅</Text>
              <Text style={[styles.kpiVal, { color: colors.accent }]}>{kpis.available}</Text>
            </View>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Available</Text>
            <Text style={{ color: colors.accent, fontSize: 10, marginTop: 4, fontWeight: '700' }}>
              Ready for client
            </Text>
          </Card>

          {/* In Rental */}
          <Card
            variant="elevated"
            padding="medium"
            style={styles.kpiCard}
            onPress={() => navigation.navigate('ActiveRentals')}
          >
            <View style={styles.kpiTop}>
              <Text style={{ fontSize: 18 }}>🔑</Text>
              <Text style={[styles.kpiVal, { color: colors.primary }]}>{kpis.inRental}</Text>
            </View>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>In Rental</Text>
            <Text style={{ color: colors.primary, fontSize: 10, marginTop: 4, fontWeight: '700' }}>
              On-trip tracking →
            </Text>
          </Card>

          {/* Maintenance */}
          <Card
            variant="elevated"
            padding="medium"
            style={styles.kpiCard}
            onPress={() => navigation.navigate('FleetMaintenance')}
          >
            <View style={styles.kpiTop}>
              <Text style={{ fontSize: 18 }}>🛠️</Text>
              <Text style={[styles.kpiVal, { color: colors.warning }]}>{kpis.maintenance}</Text>
            </View>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Maintenance</Text>
            <Text style={{ color: colors.warning, fontSize: 10, marginTop: 4, fontWeight: '700' }}>
              Work orders →
            </Text>
          </Card>

          {/* Pending Inspections */}
          <Card
            variant="elevated"
            padding="medium"
            style={styles.kpiCard}
            onPress={() => navigation.navigate('FleetInspections')}
          >
            <View style={styles.kpiTop}>
              <Text style={{ fontSize: 18 }}>📋</Text>
              <Text style={[styles.kpiVal, { color: '#8B5CF6' }]}>{kpis.pendingInspections}</Text>
            </View>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Inspections</Text>
            <Text style={{ color: '#8B5CF6', fontSize: 10, marginTop: 4, fontWeight: '700' }}>
              Pre/post trip check →
            </Text>
          </Card>

          {/* Pending Returns */}
          <Card
            variant="elevated"
            padding="medium"
            style={styles.kpiCard}
            onPress={() => navigation.navigate('FleetReturns')}
          >
            <View style={styles.kpiTop}>
              <Text style={{ fontSize: 18 }}>📥</Text>
              <Text style={[styles.kpiVal, { color: '#3B82F6' }]}>{kpis.pendingReturns}</Text>
            </View>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Returns</Text>
            <Text style={{ color: '#3B82F6', fontSize: 10, marginTop: 4, fontWeight: '700' }}>
              Check-in desk →
            </Text>
          </Card>
        </View>

        {/* Operational Attention Notice */}
        {kpis.pendingDamageReviews > 0 ? (
          <Card
            variant="flat"
            padding="medium"
            style={[styles.urgentCard, { borderColor: colors.danger, marginTop: spacing.xs }]}
            onPress={() => navigation.navigate('DamageReports', { filterStatus: 'Pending Review' })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 10 }}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.danger, fontSize: 13, fontWeight: '800' }}>
                  {kpis.pendingDamageReviews} Damage Report Pending Review
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                  Requires manager inspection & cost estimate review. Tap to view.
                </Text>
              </View>
            </View>
          </Card>
        ) : null}

        {/* Operations Quick Tiles Grid */}
        <Text
          style={[
            styles.sectionHeading,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.md,
              marginBottom: 8,
            },
          ]}
        >
          Operational Desk Modules
        </Text>

        <View style={styles.modulesGrid}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('FleetManagerFleet')}
            style={[styles.moduleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={styles.moduleIcon}>🚘</Text>
            <Text style={[styles.moduleTitle, { color: colors.textPrimary }]}>Fleet Telematics</Text>
            <Text style={{ color: colors.textMuted, fontSize: 10 }}>{kpis.vehicles} vehicles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('FleetMaintenance')}
            style={[styles.moduleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={styles.moduleIcon}>🛠️</Text>
            <Text style={[styles.moduleTitle, { color: colors.textPrimary }]}>Maintenance</Text>
            <Text style={{ color: colors.warning, fontSize: 10 }}>{kpis.maintenance} scheduled</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('FleetInspections')}
            style={[styles.moduleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={styles.moduleIcon}>📋</Text>
            <Text style={[styles.moduleTitle, { color: colors.textPrimary }]}>Inspections</Text>
            <Text style={{ color: colors.primary, fontSize: 10 }}>Checklist desk</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ActiveRentals')}
            style={[styles.moduleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={styles.moduleIcon}>🔑</Text>
            <Text style={[styles.moduleTitle, { color: colors.textPrimary }]}>Active Rentals</Text>
            <Text style={{ color: colors.accent, fontSize: 10 }}>{kpis.inRental} on road</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('FleetReturns')}
            style={[styles.moduleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={styles.moduleIcon}>📥</Text>
            <Text style={[styles.moduleTitle, { color: colors.textPrimary }]}>Returns Desk</Text>
            <Text style={{ color: '#3B82F6', fontSize: 10 }}>{kpis.pendingReturns} pending</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('DamageReports')}
            style={[styles.moduleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={styles.moduleIcon}>🔍</Text>
            <Text style={[styles.moduleTitle, { color: colors.textPrimary }]}>Damage Reports</Text>
            <Text style={{ color: colors.danger, fontSize: 10 }}>Review claims</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('FleetTasks')}
            style={[styles.moduleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={styles.moduleIcon}>📝</Text>
            <Text style={[styles.moduleTitle, { color: colors.textPrimary }]}>Ops Tasks</Text>
            <Text style={{ color: colors.textMuted, fontSize: 10 }}>Daily checklist</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ScheduleMaintenance')}
            style={[styles.moduleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={styles.moduleIcon}>➕</Text>
            <Text style={[styles.moduleTitle, { color: colors.textPrimary }]}>Book Service</Text>
            <Text style={{ color: colors.textMuted, fontSize: 10 }}>New work order</Text>
          </TouchableOpacity>
        </View>

        {/* Priority Ops Tasks Preview */}
        <View style={styles.sectionHeaderRow}>
          <Text
            style={[
              styles.sectionHeading,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: typography.fontWeights.bold,
              },
            ]}
          >
            Daily High-Priority Tasks
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('FleetTasks')}>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>
              View All ({tasks.length}) →
            </Text>
          </TouchableOpacity>
        </View>

        {pendingTasks.map(t => (
          <Card
            key={t.id}
            variant="flat"
            padding="medium"
            style={[styles.taskItemCard, { borderColor: colors.border }]}
            onPress={() => toggleTask(t.id)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => toggleTask(t.id)}
                style={[
                  styles.checkCircle,
                  { borderColor: colors.primary, backgroundColor: 'transparent' },
                ]}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}>
                  {t.title}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>
                  {t.vehicleName} • Due {t.dueTime}
                </Text>
              </View>
              <View
                style={[
                  styles.priorityTag,
                  {
                    backgroundColor:
                      t.priority === 'High'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(245, 158, 11, 0.15)',
                    borderRadius: borderRadius.xs,
                  },
                ]}
              >
                <Text
                  style={{
                    color: t.priority === 'High' ? colors.danger : colors.warning,
                    fontSize: 9,
                    fontWeight: '800',
                  }}
                >
                  {t.priority.toUpperCase()}
                </Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubHeader: {
    marginBottom: 12,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  kpiCard: {
    width: '31%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiVal: {
    fontSize: 20,
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  urgentCard: {
    borderWidth: 1.5,
    marginBottom: 12,
  },
  sectionHeading: {
    letterSpacing: -0.2,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moduleBtn: {
    width: '48%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'flex-start',
  },
  moduleIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  moduleTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  taskItemCard: {
    marginBottom: 8,
    borderWidth: 1,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  priorityTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
