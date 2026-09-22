import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { FleetManagerStackParamList, FleetReturn, ReturnStatus } from '../../types';
import { useTheme } from '../../theme';
import { useFleet } from '../../context/FleetContext';
import { ScreenContainer, Header, Card, EmptyState } from '../../components/common';

type FleetReturnsNavProp = NativeStackNavigationProp<
  FleetManagerStackParamList,
  'FleetReturns'
>;
type FleetReturnsRouteProp = RouteProp<
  FleetManagerStackParamList,
  'FleetReturns'
>;

interface Props {
  navigation: FleetReturnsNavProp;
  route: FleetReturnsRouteProp;
}

const RETURN_TABS: (ReturnStatus | 'All')[] = [
  'All',
  'Expected',
  'Inspection Required',
  'Completed',
];

export const FleetReturnsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { returnsList } = useFleet();

  const initialTab = route.params?.filterStatus || 'All';
  const [activeTab, setActiveTab] = useState<ReturnStatus | 'All'>(initialTab);

  const filteredReturns = returnsList.filter(r => {
    if (activeTab === 'All') return true;
    return r.status === activeTab;
  });

  const getStatusColor = (status: ReturnStatus) => {
    switch (status) {
      case 'Completed':
        return colors.accent;
      case 'Inspection Required':
        return colors.warning;
      case 'Expected':
      default:
        return colors.primary;
    }
  };

  const renderReturnCard = ({ item }: { item: FleetReturn }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <Card
        variant="elevated"
        padding="medium"
        style={[styles.returnCard, { borderColor: colors.border }]}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.sm + 1, fontWeight: '700' }}>
              {item.vehicleName}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 1 }}>
              Booking: {item.bookingId}
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

        <View style={{ marginTop: 8 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            👤 Customer: {item.customerName} ({item.customerPhone})
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
            📅 Expected: {item.expectedReturnDate} at {item.expectedReturnTime}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
            📍 Hub: {item.returnLocation}
          </Text>
        </View>

        {item.conditionNotes ? (
          <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 6, fontStyle: 'italic' }}>
            Note: {item.conditionNotes}
          </Text>
        ) : null}

        {item.status !== 'Completed' ? (
          <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ProcessReturn', { returnId: item.id })}
              style={[styles.processBtn, { backgroundColor: colors.primary, borderRadius: borderRadius.sm }]}
            >
              <Text style={{ color: colors.textInverse, fontSize: 11, fontWeight: '800' }}>
                Process Check-In & Return →
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
            <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '700' }}>
              ✓ Returned • Odometer: {item.dropoffMileage} km
            </Text>
          </View>
        )}
      </Card>
    );
  };

  return (
    <ScreenContainer
      header={
        <Header
          title="Vehicle Returns Desk"
          subtitle={`${returnsList.length} Total Registered Return Actions`}
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={[styles.tabsWrapper, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={RETURN_TABS}
          keyExtractor={item => item}
          contentContainerStyle={styles.tabsRow}
          renderItem={({ item }) => {
            const isSelected = activeTab === item;
            const count =
              item === 'All'
                ? returnsList.length
                : returnsList.filter(r => r.status === item).length;
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
        data={filteredReturns}
        keyExtractor={item => item.id}
        renderItem={renderReturnCard}
        contentContainerStyle={[styles.listContent, { padding: spacing.md }]}
        ListEmptyComponent={
          <EmptyState
            title="No Return Records"
            message={`No vehicles scheduled for return under category "${activeTab}".`}
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
  returnCard: {
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
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  processBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
});
