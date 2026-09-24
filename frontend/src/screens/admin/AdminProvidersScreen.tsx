import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList, AdminProviderRecord, VerificationStatus } from '../../types';
import { useTheme } from '../../theme';
import { adminService } from '../../services/adminService';
import { ScreenContainer, Header, Card, Input, Button } from '../../components/common';

type AdminProvidersNavProp = NativeStackNavigationProp<AdminStackParamList, 'AdminProviders'>;

interface Props {
  navigation: AdminProvidersNavProp;
}

export const AdminProvidersScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [providers, setProviders] = useState<AdminProviderRecord[]>(adminService.getProviders());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | VerificationStatus>('All');
  const [selectedProvider, setSelectedProvider] = useState<AdminProviderRecord | null>(null);

  useEffect(() => {
    const unsubscribe = adminService.subscribe(() => {
      setProviders(adminService.getProviders());
    });
    return unsubscribe;
  }, []);

  const filteredProviders = providers.filter(p => {
    const matchesStatus = filterStatus === 'All' || p.verificationStatus === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.providerName.toLowerCase().includes(q) ||
      p.businessName.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleApprove = (provider: AdminProviderRecord) => {
    Alert.alert('Approve Provider', `Grant verified host credentials to ${provider.businessName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve & Verify',
        onPress: () => {
          adminService.updateProviderVerification(provider.id, 'Verified');
          adminService.updateProviderStatus(provider.id, 'Active');
          if (selectedProvider?.id === provider.id) {
            setSelectedProvider(prev => (prev ? { ...prev, verificationStatus: 'Verified', status: 'Active' } : null));
          }
        },
      },
    ]);
  };

  const handleReject = (provider: AdminProviderRecord) => {
    Alert.alert('Reject Provider', `Reject commercial fleet application for ${provider.businessName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          adminService.updateProviderVerification(provider.id, 'Rejected');
          if (selectedProvider?.id === provider.id) {
            setSelectedProvider(prev => (prev ? { ...prev, verificationStatus: 'Rejected' } : null));
          }
        },
      },
    ]);
  };

  const handleToggleSuspend = (provider: AdminProviderRecord) => {
    const newStatus = provider.status === 'Active' ? 'Suspended' : 'Active';
    Alert.alert(
      `${newStatus === 'Suspended' ? 'Suspend' : 'Activate'} Provider`,
      `Are you sure you want to ${newStatus.toLowerCase()} fleet hosting for ${provider.businessName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: newStatus === 'Suspended' ? 'Suspend' : 'Activate',
          style: newStatus === 'Suspended' ? 'destructive' : 'default',
          onPress: () => {
            adminService.updateProviderStatus(provider.id, newStatus);
            if (selectedProvider?.id === provider.id) {
              setSelectedProvider(prev => (prev ? { ...prev, status: newStatus } : null));
            }
          },
        },
      ]
    );
  };

  const getStatusBadge = (status: VerificationStatus) => {
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
          title="Fleet Providers"
          subtitle={`${filteredProviders.length} registered fleet partners`}
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Search */}
        <Input
          placeholder="Search provider, business name, or city..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchContainer}
        />

        {/* Status Filter Tabs */}
        <View style={styles.tabRow}>
          {(['All', 'Pending', 'Verified', 'Suspended'] as const).map(tab => {
            const isSelected = filterStatus === tab;
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => setFilterStatus(tab)}
                style={[
                  styles.tabButton,
                  {
                    backgroundColor: isSelected ? colors.secondary : colors.surfaceVariant,
                    borderColor: isSelected ? colors.secondary : colors.border,
                    borderRadius: borderRadius.md,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Provider Cards */}
        {filteredProviders.length === 0 ? (
          <Card variant="flat" padding="large" style={styles.emptyCard}>
            <Text style={{ fontSize: 32, textAlign: 'center' }}>🏢</Text>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: '700',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              No Providers Found
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.xs,
                textAlign: 'center',
                marginTop: 4,
              }}
            >
              No fleet providers match the selected criteria.
            </Text>
          </Card>
        ) : (
          filteredProviders.map(provider => {
            const badge = getStatusBadge(provider.verificationStatus);
            const isSuspended = provider.status === 'Suspended';

            return (
              <Card
                key={provider.id}
                variant="elevated"
                padding="medium"
                style={[
                  styles.providerCard,
                  {
                    borderColor: isSuspended ? colors.danger : colors.border,
                    backgroundColor: isSuspended ? 'rgba(239, 68, 68, 0.03)' : colors.surface,
                  },
                ]}
              >
                {/* Header Row */}
                <View style={styles.headerRow}>
                  <View style={styles.bizInfo}>
                    <View style={styles.bizIconCircle}>
                      <Text style={{ fontSize: 20 }}>🏢</Text>
                    </View>
                    <View style={styles.bizTitles}>
                      <Text
                        style={[
                          styles.bizName,
                          {
                            color: colors.textPrimary,
                            fontSize: typography.fontSizes.md,
                            fontWeight: typography.fontWeights.bold,
                          },
                        ]}
                      >
                        {provider.businessName}
                      </Text>
                      <Text
                        style={[
                          styles.leadName,
                          {
                            color: colors.textSecondary,
                            fontSize: typography.fontSizes.xs,
                          },
                        ]}
                      >
                        Owner: {provider.providerName}
                      </Text>
                    </View>
                  </View>

                  {/* Verification & Status Badges */}
                  <View style={styles.badgesWrapper}>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: badge.bg,
                          borderColor: badge.border,
                        },
                      ]}
                    >
                      <Text style={[styles.badgeText, { color: badge.text }]}>
                        {provider.verificationStatus.toUpperCase()}
                      </Text>
                    </View>
                    {isSuspended && (
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            borderColor: colors.danger,
                            marginTop: 4,
                          },
                        ]}
                      >
                        <Text style={[styles.badgeText, { color: colors.danger }]}>SUSPENDED</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Metrics Row: Fleet size, Revenue, Status */}
                <View style={[styles.metricsRow, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.sm }]}>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Fleet Size</Text>
                    <Text style={[styles.metricValue, { color: colors.primary }]}>
                      {provider.fleetSize} Vehicles
                    </Text>
                  </View>

                  <View style={styles.metricDivider} />

                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>GMV Revenue</Text>
                    <Text style={[styles.metricValue, { color: colors.success || '#10B981' }]}>
                      ${provider.revenue.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.metricDivider} />

                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Account Status</Text>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: provider.status === 'Active' ? colors.success || '#10B981' : colors.danger },
                      ]}
                    >
                      {provider.status}
                    </Text>
                  </View>
                </View>

                {/* Sub details: City, Tax ID */}
                <View style={styles.subDetailRow}>
                  <Text style={[styles.subDetailText, { color: colors.textMuted }]}>
                    📍 {provider.city}
                  </Text>
                  {provider.taxId && (
                    <Text style={[styles.subDetailText, { color: colors.textMuted }]}>
                      🛡️ {provider.taxId}
                    </Text>
                  )}
                  <Text style={[styles.subDetailText, { color: colors.textMuted }]}>
                    📅 {provider.joinedDate}
                  </Text>
                </View>

                {/* Actions: View, Approve, Reject, Suspend */}
                <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
                  <Button
                    title="View"
                    variant="outline"
                    size="small"
                    onPress={() => setSelectedProvider(provider)}
                    style={styles.actionBtn}
                  />

                  {provider.verificationStatus !== 'Verified' && (
                    <Button
                      title="Approve"
                      variant="primary"
                      size="small"
                      onPress={() => handleApprove(provider)}
                      style={styles.actionBtn}
                    />
                  )}

                  {provider.verificationStatus !== 'Rejected' && provider.verificationStatus !== 'Verified' && (
                    <Button
                      title="Reject"
                      variant="secondary"
                      size="small"
                      onPress={() => handleReject(provider)}
                      style={styles.actionBtn}
                    />
                  )}

                  <Button
                    title={isSuspended ? 'Reactivate' : 'Suspend'}
                    variant={isSuspended ? 'outline' : 'danger'}
                    size="small"
                    onPress={() => handleToggleSuspend(provider)}
                    style={styles.actionBtn}
                  />
                </View>
              </Card>
            );
          })
        )}

        {/* Provider Details Modal */}
        <Modal
          visible={Boolean(selectedProvider)}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedProvider(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.surface, borderRadius: borderRadius.xl }]}>
              {selectedProvider && (
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
                      Provider Profile Dossier
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSelectedProvider(null)}
                      style={[styles.closeBtn, { backgroundColor: colors.surfaceVariant }]}
                    >
                      <Text style={{ fontSize: 16, color: colors.textPrimary }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollBody} contentContainerStyle={styles.modalScrollContent}>
                    <View style={styles.modalBody}>
                      <View style={styles.dossierRow}>
                        <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Business Name</Text>
                        <Text style={[styles.dossierValue, { color: colors.textPrimary, fontWeight: '700' }]}>
                          {selectedProvider.businessName}
                        </Text>
                      </View>

                      <View style={styles.dossierRow}>
                        <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Principal Host</Text>
                        <Text style={[styles.dossierValue, { color: colors.textPrimary }]}>
                          {selectedProvider.providerName}
                        </Text>
                      </View>

                      <View style={styles.dossierRow}>
                        <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Business Email</Text>
                        <Text style={[styles.dossierValue, { color: colors.textPrimary }]}>
                          {selectedProvider.email}
                        </Text>
                      </View>

                      <View style={styles.dossierRow}>
                        <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Direct Phone</Text>
                        <Text style={[styles.dossierValue, { color: colors.textPrimary }]}>
                          {selectedProvider.phone}
                        </Text>
                      </View>

                      <View style={styles.dossierRow}>
                        <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Operating Depot</Text>
                        <Text style={[styles.dossierValue, { color: colors.textPrimary }]}>
                          {selectedProvider.city}
                        </Text>
                      </View>

                      <View style={styles.dossierRow}>
                        <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Corporate Tax ID</Text>
                        <Text style={[styles.dossierValue, { color: colors.accent, fontWeight: '700' }]}>
                          {selectedProvider.taxId || 'N/A'}
                        </Text>
                      </View>

                      <View style={styles.dossierRow}>
                        <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Fleet Capacity</Text>
                        <Text style={[styles.dossierValue, { color: colors.primary, fontWeight: '800' }]}>
                          {selectedProvider.fleetSize} Active Vehicles
                        </Text>
                      </View>

                      <View style={styles.dossierRow}>
                        <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Cumulative Revenue</Text>
                        <Text style={[styles.dossierValue, { color: colors.success || '#10B981', fontWeight: '800' }]}>
                          ${selectedProvider.revenue.toLocaleString()}
                        </Text>
                      </View>

                      <View style={styles.dossierRow}>
                        <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>KYC Verification</Text>
                        <Text
                          style={[
                            styles.dossierValue,
                            { color: getStatusBadge(selectedProvider.verificationStatus).text, fontWeight: '700' },
                          ]}
                        >
                          {selectedProvider.verificationStatus}
                        </Text>
                      </View>

                      <View style={[styles.dossierRow, { borderBottomWidth: 0 }]}>
                        <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Host Status</Text>
                        <Text
                          style={[
                            styles.dossierValue,
                            {
                              color: selectedProvider.status === 'Active' ? colors.success || '#10B981' : colors.danger,
                              fontWeight: '800',
                            },
                          ]}
                        >
                          {selectedProvider.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </ScrollView>

                  <View style={styles.modalFooter}>
                    {selectedProvider.verificationStatus !== 'Verified' && (
                      <Button
                        title="Approve & Grant Host Status"
                        variant="primary"
                        size="medium"
                        onPress={() => handleApprove(selectedProvider)}
                        style={{ marginBottom: 8 }}
                      />
                    )}
                    <Button
                      title={selectedProvider.status === 'Active' ? 'Suspend Host' : 'Reactivate Host'}
                      variant={selectedProvider.status === 'Active' ? 'danger' : 'outline'}
                      size="medium"
                      onPress={() => handleToggleSuspend(selectedProvider)}
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
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
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
  providerCard: {
    marginBottom: 14,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bizInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bizIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  bizTitles: {
    flex: 1,
  },
  bizName: {
    letterSpacing: -0.2,
  },
  leadName: {
    marginTop: 2,
  },
  badgesWrapper: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 12,
    marginBottom: 10,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  subDetailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  subDetailText: {
    fontSize: 11,
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  modalScrollBody: {
    flexShrink: 1,
  },
  modalScrollContent: {
    paddingBottom: 4,
  },
  modalBody: {
    marginBottom: 16,
  },
  dossierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
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
    marginTop: 8,
  },
});
