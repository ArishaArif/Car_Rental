import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList, DisputeRecord, DisputeStatus } from '../../types';
import { useTheme } from '../../theme';
import { adminService } from '../../services/adminService';
import { ScreenContainer, Header, Card, Input, Button } from '../../components/common';

type AdminDisputesNavProp = NativeStackNavigationProp<AdminStackParamList, 'AdminDisputes'>;
type AdminDisputesRouteProp = RouteProp<AdminStackParamList, 'AdminDisputes'>;

interface Props {
  navigation: AdminDisputesNavProp;
  route: AdminDisputesRouteProp;
}

export const AdminDisputesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const initialFilter = route.params?.filterStatus || 'All';
  const [selectedStatus, setSelectedStatus] = useState<DisputeStatus | 'All'>(initialFilter);
  const [disputes, setDisputes] = useState<DisputeRecord[]>(adminService.getDisputes());
  const [activeDispute, setActiveDispute] = useState<DisputeRecord | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  useEffect(() => {
    const unsubscribe = adminService.subscribe(() => {
      setDisputes(adminService.getDisputes());
    });
    return unsubscribe;
  }, []);

  const filteredDisputes = disputes.filter(
    d => selectedStatus === 'All' || d.status === selectedStatus
  );

  const handleUpdateStatus = (
    dispute: DisputeRecord,
    newStatus: DisputeStatus,
    notes?: string
  ) => {
    adminService.updateDisputeStatus(dispute.id, newStatus, notes);
    if (activeDispute?.id === dispute.id) {
      setActiveDispute(prev => (prev ? { ...prev, status: newStatus, adminNotes: notes || prev.adminNotes } : null));
    }
  };

  const handleResolve = (dispute: DisputeRecord) => {
    Alert.alert(
      'Resolve Dispute',
      `Select mediation outcome for ${dispute.id} ($${dispute.disputedAmount}):`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refund Customer',
          onPress: () => {
            const note = 'Resolved: Full disputed amount refunded to customer wallet.';
            handleUpdateStatus(dispute, 'Resolved', note);
          },
        },
        {
          text: 'Award to Provider',
          onPress: () => {
            const note = 'Resolved: Host claim validated; charges deducted from deposit.';
            handleUpdateStatus(dispute, 'Resolved', note);
          },
        },
      ]
    );
  };

  const getStatusBadge = (status: DisputeStatus) => {
    switch (status) {
      case 'Resolved':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: colors.success || '#10B981', border: '#10B981' };
      case 'Under Review':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', border: '#3B82F6' };
      case 'Open':
      default:
        return { bg: 'rgba(239, 68, 68, 0.15)', text: colors.danger, border: colors.danger };
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Dispute Mediation Desk"
          subtitle="Resolve damage claims, return delays & billing discrepancies"
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Status Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
          contentContainerStyle={styles.tabScrollContainer}
        >
          {(['All', 'Open', 'Under Review', 'Resolved'] as const).map(tab => {
            const isSelected = selectedStatus === tab;
            const count =
              tab === 'All' ? disputes.length : disputes.filter(d => d.status === tab).length;

            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => setSelectedStatus(tab)}
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
                  {tab} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Dispute Cards List */}
        {filteredDisputes.length === 0 ? (
          <Card variant="flat" padding="large" style={styles.emptyCard}>
            <Text style={{ fontSize: 32, textAlign: 'center' }}>⚖️</Text>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: '700',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              No Disputes Found
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.xs,
                textAlign: 'center',
                marginTop: 4,
              }}
            >
              There are no mediation claims in the {selectedStatus} queue.
            </Text>
          </Card>
        ) : (
          filteredDisputes.map(dispute => {
            const badge = getStatusBadge(dispute.status);

            return (
              <Card
                key={dispute.id}
                variant="elevated"
                padding="medium"
                style={styles.disputeCard}
              >
                {/* Header */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text
                      style={[
                        styles.disputeId,
                        {
                          color: colors.primary,
                          fontSize: typography.fontSizes.sm,
                          fontWeight: '800',
                        },
                      ]}
                    >
                      {dispute.id} • {dispute.bookingId}
                    </Text>
                    <Text
                      style={[
                        styles.vehicleName,
                        { color: colors.textPrimary, fontSize: typography.fontSizes.xs, marginTop: 2 },
                      ]}
                    >
                      🚗 {dispute.vehicleName}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: badge.bg, borderColor: badge.border },
                    ]}
                  >
                    <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                      {dispute.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Counterparties */}
                <View
                  style={[
                    styles.partiesBox,
                    { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm },
                  ]}
                >
                  <Text style={[styles.partyLine, { color: colors.textSecondary }]}>
                    Renter: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>👤 {dispute.customerName}</Text>
                  </Text>
                  <Text style={[styles.partyLine, { color: colors.textSecondary, marginTop: 2 }]}>
                    Host: <Text style={{ color: colors.secondary, fontWeight: '700' }}>🏢 {dispute.providerName}</Text>
                  </Text>
                  <Text style={[styles.partyLine, { color: colors.textSecondary, marginTop: 2 }]}>
                    Disputed Amount: <Text style={{ color: colors.danger, fontWeight: '800' }}>${dispute.disputedAmount} USD</Text>
                  </Text>
                </View>

                {/* Claim Reason */}
                <View style={styles.claimSection}>
                  <Text style={[styles.claimHeading, { color: colors.textSecondary }]}>
                    Reason for Dispute:
                  </Text>
                  <Text style={[styles.claimText, { color: colors.textPrimary }]}>
                    {dispute.reason}
                  </Text>
                </View>

                {/* Evidence snippet */}
                {dispute.evidence && (
                  <View style={styles.evidenceSection}>
                    <Text style={[styles.evidenceHeading, { color: colors.textSecondary }]}>
                      Submitted Evidence:
                    </Text>
                    <Text style={[styles.evidenceText, { color: colors.textMuted }]}>
                      📸 {dispute.evidence}
                    </Text>
                  </View>
                )}

                {/* Admin notes */}
                {dispute.adminNotes && (
                  <View
                    style={[
                      styles.notesBox,
                      { backgroundColor: 'rgba(59, 130, 246, 0.08)', borderRadius: borderRadius.xs },
                    ]}
                  >
                    <Text style={{ color: '#3B82F6', fontSize: 10, fontWeight: '800' }}>
                      ADMIN RESOLUTION LOG:
                    </Text>
                    <Text style={{ color: colors.textPrimary, fontSize: 11, marginTop: 2 }}>
                      {dispute.adminNotes}
                    </Text>
                  </View>
                )}

                {/* Local Status Modification Actions */}
                <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
                  {dispute.status === 'Open' && (
                    <Button
                      title="Start Review"
                      variant="primary"
                      size="small"
                      onPress={() => handleUpdateStatus(dispute, 'Under Review', 'Admin started evidence review.')}
                      style={styles.actionBtn}
                    />
                  )}

                  {dispute.status !== 'Resolved' && (
                    <Button
                      title="Resolve Dispute"
                      variant="secondary"
                      size="small"
                      onPress={() => handleResolve(dispute)}
                      style={styles.actionBtn}
                    />
                  )}

                  {dispute.status === 'Resolved' && (
                    <Button
                      title="Reopen Dispute"
                      variant="outline"
                      size="small"
                      onPress={() => handleUpdateStatus(dispute, 'Open', 'Reopened by Admin for re-investigation.')}
                      style={styles.actionBtn}
                    />
                  )}

                  <Button
                    title="Add Notes"
                    variant="outline"
                    size="small"
                    onPress={() => {
                      setActiveDispute(dispute);
                      setResolutionNote(dispute.adminNotes || '');
                    }}
                    style={styles.actionBtn}
                  />
                </View>
              </Card>
            );
          })
        )}

        {/* Add Note Modal */}
        <Modal
          visible={Boolean(activeDispute)}
          animationType="fade"
          transparent
          onRequestClose={() => setActiveDispute(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.surface, borderRadius: borderRadius.xl }]}>
              {activeDispute && (
                <>
                  <Text
                    style={[
                      styles.modalTitle,
                      {
                        color: colors.textPrimary,
                        fontSize: typography.fontSizes.md,
                        fontWeight: typography.fontWeights.bold,
                        marginBottom: 10,
                      },
                    ]}
                  >
                    Mediation Notes: {activeDispute.id}
                  </Text>

                  <Input
                    label="Admin Internal Findings / Resolution"
                    multiline
                    numberOfLines={4}
                    value={resolutionNote}
                    onChangeText={setResolutionNote}
                    placeholder="Enter factual summary, dmv verification, or settlement decision..."
                    containerStyle={{ marginBottom: 16 }}
                  />

                  <View style={styles.modalBtns}>
                    <Button
                      title="Cancel"
                      variant="outline"
                      size="medium"
                      onPress={() => setActiveDispute(null)}
                      style={{ flex: 1, marginRight: 8 }}
                    />
                    <Button
                      title="Save Notes"
                      variant="primary"
                      size="medium"
                      onPress={() => {
                        handleUpdateStatus(activeDispute, activeDispute.status, resolutionNote);
                        setActiveDispute(null);
                      }}
                      style={{ flex: 1 }}
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
    paddingHorizontal: 14,
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
  disputeCard: {
    marginBottom: 14,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  disputeId: {
    letterSpacing: 0.5,
  },
  vehicleName: {
    fontWeight: '500',
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
  },
  partiesBox: {
    padding: 8,
    marginTop: 10,
    marginBottom: 8,
  },
  partyLine: {
    fontSize: 11,
  },
  claimSection: {
    marginBottom: 6,
  },
  claimHeading: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  claimText: {
    fontSize: 12,
    lineHeight: 16,
  },
  evidenceSection: {
    marginBottom: 8,
  },
  evidenceHeading: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  evidenceText: {
    fontSize: 11,
    lineHeight: 16,
  },
  notesBox: {
    padding: 8,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
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
  },
  modalTitle: {
    letterSpacing: -0.2,
  },
  modalBtns: {
    flexDirection: 'row',
  },
});
