import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList, AdminVerificationItem, VerificationStatus } from '../../types';
import { useTheme } from '../../theme';
import { adminService } from '../../services/adminService';
import { ScreenContainer, Header, Card, Button } from '../../components/common';

type CustomerVerifNavProp = NativeStackNavigationProp<
  AdminStackParamList,
  'AdminCustomerVerification'
>;
type CustomerVerifRouteProp = RouteProp<AdminStackParamList, 'AdminCustomerVerification'>;

interface Props {
  navigation: CustomerVerifNavProp;
  route: CustomerVerifRouteProp;
}

export const AdminCustomerVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const initialFilter = route.params?.filterStatus || 'Pending';
  const [selectedStatus, setSelectedStatus] = useState<VerificationStatus | 'All'>(initialFilter);
  const [items, setItems] = useState<AdminVerificationItem[]>(adminService.getCustomerVerifications());

  useEffect(() => {
    const unsubscribe = adminService.subscribe(() => {
      setItems(adminService.getCustomerVerifications());
    });
    return unsubscribe;
  }, []);

  const filteredItems = items.filter(
    item => selectedStatus === 'All' || item.status === selectedStatus
  );

  const handleUpdateStatus = (item: AdminVerificationItem, newStatus: VerificationStatus) => {
    Alert.alert(
      `Mark as ${newStatus}`,
      `Update customer KYC verification for ${item.name} to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: newStatus === 'Rejected' || newStatus === 'Suspended' ? 'destructive' : 'default',
          onPress: () => {
            adminService.updateVerificationItemStatus(item.id, newStatus);
            // Also sync the user record
            adminService.verifyUser(item.targetId, newStatus);
          },
        },
      ]
    );
  };

  const getBadgeStyle = (status: VerificationStatus) => {
    switch (status) {
      case 'Verified':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: colors.success || '#10B981', border: '#10B981' };
      case 'Rejected':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: colors.danger, border: colors.danger };
      case 'Suspended':
        return { bg: 'rgba(244, 63, 94, 0.15)', text: '#F43F5E', border: '#F43F5E' };
      case 'Pending':
      default:
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#D97706', border: '#F59E0B' };
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Customer KYC Verification"
          subtitle="Driver's license compliance & identity checks"
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Status Tabs */}
        <View style={styles.tabContainer}>
          {(['Pending', 'Verified', 'Rejected', 'Suspended', 'All'] as const).map(tab => {
            const isSelected = selectedStatus === tab;
            const count =
              tab === 'All' ? items.length : items.filter(i => i.status === tab).length;

            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => setSelectedStatus(tab)}
                style={[
                  styles.tabBtn,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: borderRadius.md,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    {
                      color: isSelected ? colors.textInverse : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {tab} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Verification Items */}
        {filteredItems.length === 0 ? (
          <Card variant="flat" padding="large" style={styles.emptyCard}>
            <Text style={{ fontSize: 32, textAlign: 'center' }}>🪪</Text>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: '700',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              No Customer Verifications in Queue
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.xs,
                textAlign: 'center',
                marginTop: 4,
              }}
            >
              There are no customer verification items with status: {selectedStatus}.
            </Text>
          </Card>
        ) : (
          filteredItems.map(item => {
            const badge = getBadgeStyle(item.status);

            return (
              <Card key={item.id} variant="elevated" padding="medium" style={styles.itemCard}>
                {/* Header */}
                <View style={styles.itemHeader}>
                  <View style={styles.nameBlock}>
                    <Text
                      style={[
                        styles.userName,
                        {
                          color: colors.textPrimary,
                          fontSize: typography.fontSizes.md,
                          fontWeight: typography.fontWeights.bold,
                        },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.licenseId,
                        {
                          color: colors.accent,
                          fontSize: typography.fontSizes.xs,
                          fontWeight: '700',
                          marginTop: 2,
                        },
                      ]}
                    >
                      Driver License: {item.identifier}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: badge.bg, borderColor: badge.border },
                    ]}
                  >
                    <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Document Information Cardlet */}
                <View
                  style={[
                    styles.docBox,
                    { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm },
                  ]}
                >
                  <View style={styles.docRow}>
                    <Text style={[styles.docLabel, { color: colors.textSecondary }]}>
                      Credential Type:
                    </Text>
                    <Text style={[styles.docVal, { color: colors.textPrimary, fontWeight: '700' }]}>
                      {item.documentType}
                    </Text>
                  </View>

                  <View style={styles.docRow}>
                    <Text style={[styles.docLabel, { color: colors.textSecondary }]}>
                      Document Serial:
                    </Text>
                    <Text style={[styles.docVal, { color: colors.textPrimary }]}>
                      {item.documentNumber}
                    </Text>
                  </View>

                  {item.expiryDate && (
                    <View style={styles.docRow}>
                      <Text style={[styles.docLabel, { color: colors.textSecondary }]}>
                        License Expiration:
                      </Text>
                      <Text style={[styles.docVal, { color: colors.warning, fontWeight: '700' }]}>
                        {item.expiryDate}
                      </Text>
                    </View>
                  )}

                  <View style={[styles.docRow, { borderBottomWidth: 0 }]}>
                    <Text style={[styles.docLabel, { color: colors.textSecondary }]}>
                      Date Submitted:
                    </Text>
                    <Text style={[styles.docVal, { color: colors.textMuted }]}>
                      {item.submittedDate}
                    </Text>
                  </View>
                </View>

                {/* Audit Notes */}
                {item.notes && (
                  <View style={styles.notesBox}>
                    <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
                      Identity Verification Note:
                    </Text>
                    <Text style={[styles.notesText, { color: colors.textPrimary }]}>
                      {item.notes}
                    </Text>
                  </View>
                )}

                {/* Verification Actions: Approve, Reject, Suspend, Reset */}
                <View style={[styles.btnRow, { borderTopColor: colors.border }]}>
                  {item.status !== 'Verified' && (
                    <Button
                      title="Approve"
                      variant="primary"
                      size="small"
                      onPress={() => handleUpdateStatus(item, 'Verified')}
                      style={styles.actionBtn}
                    />
                  )}

                  {item.status !== 'Rejected' && (
                    <Button
                      title="Reject"
                      variant="secondary"
                      size="small"
                      onPress={() => handleUpdateStatus(item, 'Rejected')}
                      style={styles.actionBtn}
                    />
                  )}

                  {item.status !== 'Suspended' && (
                    <Button
                      title="Suspend"
                      variant="danger"
                      size="small"
                      onPress={() => handleUpdateStatus(item, 'Suspended')}
                      style={styles.actionBtn}
                    />
                  )}

                  {item.status !== 'Pending' && (
                    <Button
                      title="Set Pending"
                      variant="outline"
                      size="small"
                      onPress={() => handleUpdateStatus(item, 'Pending')}
                      style={styles.actionBtn}
                    />
                  )}
                </View>
              </Card>
            );
          })
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  tabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
  },
  tabBtnText: {
    fontSize: 11,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  itemCard: {
    marginBottom: 14,
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameBlock: {
    flex: 1,
  },
  userName: {
    letterSpacing: -0.2,
  },
  licenseId: {
    letterSpacing: 0.2,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  docBox: {
    padding: 10,
    marginTop: 10,
    marginBottom: 8,
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  docLabel: {
    fontSize: 11,
  },
  docVal: {
    fontSize: 11,
    maxWidth: '65%',
    textAlign: 'right',
  },
  notesBox: {
    marginBottom: 10,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  notesText: {
    fontSize: 11,
    lineHeight: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 0.5,
  },
  actionBtn: {
    flex: 1,
  },
});
