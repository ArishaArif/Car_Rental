import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList, AdminUserRecord, UserRole } from '../../types';
import { useTheme } from '../../theme';
import { adminService } from '../../services/adminService';
import { ScreenContainer, Header, Card, Input, Button } from '../../components/common';

type AdminUsersNavProp = NativeStackNavigationProp<AdminStackParamList, 'AdminUsers'>;

interface Props {
  navigation: AdminUsersNavProp;
}

export const AdminUsersScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [users, setUsers] = useState<AdminUserRecord[]>(adminService.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'All' | UserRole>('All');
  const [activeUserDetail, setActiveUserDetail] = useState<AdminUserRecord | null>(null);

  useEffect(() => {
    const unsubscribe = adminService.subscribe(() => {
      setUsers(adminService.getUsers());
    });
    return unsubscribe;
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesRole = selectedRoleFilter === 'All' || u.role === selectedRoleFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const handleToggleSuspend = (userItem: AdminUserRecord) => {
    const newStatus = userItem.status === 'Active' ? 'Suspended' : 'Active';
    Alert.alert(
      `${newStatus === 'Suspended' ? 'Suspend' : 'Activate'} User`,
      `Are you sure you want to ${newStatus.toLowerCase()} account access for ${userItem.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: newStatus === 'Suspended' ? 'Suspend' : 'Activate',
          style: newStatus === 'Suspended' ? 'destructive' : 'default',
          onPress: () => {
            adminService.updateUserStatus(userItem.id, newStatus);
            if (activeUserDetail?.id === userItem.id) {
              setActiveUserDetail(prev => (prev ? { ...prev, status: newStatus } : null));
            }
          },
        },
      ]
    );
  };

  const handleToggleVerify = (userItem: AdminUserRecord) => {
    const newVerif = userItem.verificationStatus === 'Verified' ? 'Pending' : 'Verified';
    adminService.verifyUser(userItem.id, newVerif);
    if (activeUserDetail?.id === userItem.id) {
      setActiveUserDetail(prev => (prev ? { ...prev, verificationStatus: newVerif } : null));
    }
  };

  const getVerificationBadgeStyle = (status: string) => {
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
          title="Users Directory"
          subtitle={`${filteredUsers.length} platform accounts`}
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Search Bar */}
        <Input
          placeholder="Search by name, email or city..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchContainer}
        />

        {/* Role Filter Tabs */}
        <View style={styles.tabRow}>
          {(['All', 'Customer', 'Provider'] as const).map(tab => {
            const isSelected = selectedRoleFilter === tab;
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => setSelectedRoleFilter(tab)}
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
                  {tab === 'All' ? 'All Roles' : `${tab}s`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <Card variant="flat" padding="large" style={styles.emptyCard}>
            <Text style={{ fontSize: 32, textAlign: 'center' }}>🔍</Text>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: '700',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              No Users Found
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.xs,
                textAlign: 'center',
                marginTop: 4,
              }}
            >
              No user accounts match your current filter query.
            </Text>
          </Card>
        ) : (
          filteredUsers.map(userItem => {
            const verifBadge = getVerificationBadgeStyle(userItem.verificationStatus);
            const isSuspended = userItem.status === 'Suspended';

            return (
              <Card
                key={userItem.id}
                variant="elevated"
                padding="medium"
                style={[
                  styles.userCard,
                  {
                    borderColor: isSuspended ? colors.danger : colors.border,
                    backgroundColor: isSuspended ? 'rgba(239, 68, 68, 0.03)' : colors.surface,
                  },
                ]}
              >
                {/* Header Row */}
                <View style={styles.userHeaderRow}>
                  <View style={styles.nameAndRole}>
                    <View style={styles.avatarCircle}>
                      <Text style={{ fontSize: 18 }}>
                        {userItem.role === 'Provider' ? '🏢' : '🚗'}
                      </Text>
                    </View>
                    <View style={styles.userNamesContainer}>
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
                        {userItem.name}
                      </Text>
                      <Text
                        style={[
                          styles.userEmail,
                          {
                            color: colors.textSecondary,
                            fontSize: typography.fontSizes.xs,
                          },
                        ]}
                      >
                        {userItem.email}
                      </Text>
                    </View>
                  </View>

                  {/* Status Badges */}
                  <View style={styles.badgesCol}>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: verifBadge.bg,
                          borderColor: verifBadge.border,
                        },
                      ]}
                    >
                      <Text style={[styles.badgeText, { color: verifBadge.text }]}>
                        {userItem.verificationStatus.toUpperCase()}
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

                {/* Sub details */}
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                    📍 {userItem.city}
                  </Text>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                    📅 Joined: {userItem.joinedDate}
                  </Text>
                  <Text style={[styles.infoLabel, { color: colors.primary, fontWeight: '700' }]}>
                    {userItem.role === 'Provider'
                      ? `${userItem.totalBookingsOrVehicles} Fleet Units`
                      : `${userItem.totalBookingsOrVehicles} Rentals`}
                  </Text>
                </View>

                {/* Actions: View, Verify, Suspend */}
                <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
                  <Button
                    title="View"
                    variant="outline"
                    size="small"
                    onPress={() => setActiveUserDetail(userItem)}
                    style={styles.actionBtn}
                  />

                  <Button
                    title={userItem.verificationStatus === 'Verified' ? 'Unverify' : 'Verify'}
                    variant={userItem.verificationStatus === 'Verified' ? 'secondary' : 'primary'}
                    size="small"
                    onPress={() => handleToggleVerify(userItem)}
                    style={styles.actionBtn}
                  />

                  <Button
                    title={isSuspended ? 'Reactivate' : 'Suspend'}
                    variant={isSuspended ? 'outline' : 'danger'}
                    size="small"
                    onPress={() => handleToggleSuspend(userItem)}
                    style={styles.actionBtn}
                  />
                </View>
              </Card>
            );
          })
        )}

        {/* User Details Modal */}
        <Modal
          visible={Boolean(activeUserDetail)}
          animationType="slide"
          transparent
          onRequestClose={() => setActiveUserDetail(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.surface, borderRadius: borderRadius.xl }]}>
              {activeUserDetail && (
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
                      Account Dossier
                    </Text>
                    <TouchableOpacity
                      onPress={() => setActiveUserDetail(null)}
                      style={[styles.closeBtn, { backgroundColor: colors.surfaceVariant }]}
                    >
                      <Text style={{ fontSize: 16, color: colors.textPrimary }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalBody}>
                    <View style={styles.dossierRow}>
                      <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Full Name</Text>
                      <Text style={[styles.dossierValue, { color: colors.textPrimary }]}>
                        {activeUserDetail.name}
                      </Text>
                    </View>

                    <View style={styles.dossierRow}>
                      <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Email</Text>
                      <Text style={[styles.dossierValue, { color: colors.textPrimary }]}>
                        {activeUserDetail.email}
                      </Text>
                    </View>

                    <View style={styles.dossierRow}>
                      <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Role</Text>
                      <Text style={[styles.dossierValue, { color: colors.primary, fontWeight: '700' }]}>
                        {activeUserDetail.role}
                      </Text>
                    </View>

                    <View style={styles.dossierRow}>
                      <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Contact Phone</Text>
                      <Text style={[styles.dossierValue, { color: colors.textPrimary }]}>
                        {activeUserDetail.phone}
                      </Text>
                    </View>

                    <View style={styles.dossierRow}>
                      <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>Registered City</Text>
                      <Text style={[styles.dossierValue, { color: colors.textPrimary }]}>
                        {activeUserDetail.city}
                      </Text>
                    </View>

                    {activeUserDetail.licenseNumber ? (
                      <View style={styles.dossierRow}>
                        <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>
                          Driver License
                        </Text>
                        <Text style={[styles.dossierValue, { color: colors.accent, fontWeight: '700' }]}>
                          {activeUserDetail.licenseNumber}
                        </Text>
                      </View>
                    ) : null}

                    {activeUserDetail.businessName ? (
                      <View style={styles.dossierRow}>
                        <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>
                          Registered Business
                        </Text>
                        <Text style={[styles.dossierValue, { color: colors.textPrimary, fontWeight: '700' }]}>
                          {activeUserDetail.businessName}
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.dossierRow}>
                      <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>
                        Verification Status
                      </Text>
                      <Text
                        style={[
                          styles.dossierValue,
                          {
                            color: getVerificationBadgeStyle(activeUserDetail.verificationStatus).text,
                            fontWeight: '700',
                          },
                        ]}
                      >
                        {activeUserDetail.verificationStatus}
                      </Text>
                    </View>

                    <View style={[styles.dossierRow, { borderBottomWidth: 0 }]}>
                      <Text style={[styles.dossierLabel, { color: colors.textSecondary }]}>
                        Account Standing
                      </Text>
                      <Text
                        style={[
                          styles.dossierValue,
                          {
                            color: activeUserDetail.status === 'Active' ? colors.success || '#10B981' : colors.danger,
                            fontWeight: '800',
                          },
                        ]}
                      >
                        {activeUserDetail.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalFooter}>
                    <Button
                      title={activeUserDetail.verificationStatus === 'Verified' ? 'Mark Unverified' : 'Mark Verified'}
                      variant={activeUserDetail.verificationStatus === 'Verified' ? 'secondary' : 'primary'}
                      size="medium"
                      onPress={() => handleToggleVerify(activeUserDetail)}
                      style={{ marginBottom: 8 }}
                    />
                    <Button
                      title={activeUserDetail.status === 'Active' ? 'Suspend Account' : 'Reactivate Account'}
                      variant={activeUserDetail.status === 'Active' ? 'danger' : 'outline'}
                      size="medium"
                      onPress={() => handleToggleSuspend(activeUserDetail)}
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
    fontSize: 12,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  userCard: {
    marginBottom: 12,
    borderWidth: 1,
  },
  userHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameAndRole: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  userNamesContainer: {
    flex: 1,
  },
  userName: {
    letterSpacing: -0.2,
  },
  userEmail: {
    marginTop: 2,
  },
  badgesCol: {
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
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    marginBottom: 12,
  },
  infoLabel: {
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
  modalBody: {
    marginBottom: 16,
  },
  dossierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  dossierLabel: {
    fontSize: 12,
  },
  dossierValue: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: '65%',
    textAlign: 'right',
  },
  modalFooter: {
    marginTop: 8,
  },
});
