import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, UserRole } from '../../types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer, Button, Header } from '../../components/common';

type RoleSelectionNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'RoleSelection'
>;

interface RoleSelectionProps {
  navigation: RoleSelectionNavigationProp;
}

interface RoleOption {
  role: UserRole;
  badge: string;
  icon: string;
  title: string;
  subtitle: string;
  perks: string[];
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'Customer',
    badge: 'RENTER & DRIVER',
    icon: '🚗',
    title: 'Customer / Renter',
    subtitle: 'Browse premium fleets, book instantly, and unlock on-demand vehicles.',
    perks: ['Zero paperwork booking', 'Instant digital car key', 'Comprehensive coverage'],
  },
  {
    role: 'Provider',
    badge: 'FLEET OWNER',
    icon: '🏢',
    title: 'Rental Service Provider',
    subtitle: 'List vehicles, optimize fleet yield, and monitor live rentals seamlessly.',
    perks: ['Real-time telematics', 'Automated payouts & yield', 'Fleet maintenance logs'],
  },
  {
    role: 'FleetManager',
    badge: 'FLEET OPERATIONS',
    icon: '🛠️',
    title: 'Fleet Manager',
    subtitle: 'Manage maintenance, vehicle inspections, returns desk, and daily dispatch.',
    perks: ['Service & inspection checklists', 'Live returns processing', 'Operational task tracking'],
  },
  {
    role: 'Admin',
    badge: 'SYSTEM CONTROL',
    icon: '🛡️',
    title: 'System Administrator',
    subtitle: 'Platform security oversight, user verification, and ecosystem analytics.',
    perks: ['Global audit log', 'KYC & host approval', 'System policy settings'],
  },
];

export const RoleSelectionScreen: React.FC<RoleSelectionProps> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { role: activeRole, selectRole } = useAuth();
  const [selectedRole, setSelectedRoleState] = useState<UserRole>(activeRole || 'Customer');

  const handleSelectRole = async (role: UserRole) => {
    setSelectedRoleState(role);
    await selectRole(role);
  };

  const handleContinueLogin = () => {
    navigation.navigate('Login', { role: selectedRole });
  };

  const handleContinueRegister = () => {
    navigation.navigate('Register', { role: selectedRole });
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Account Role"
          subtitle="Choose how you want to experience the platform"
          showBack
          onBackPress={() => navigation.goBack()}
          transparent
        />
      }
      footer={
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              padding: spacing.md,
            },
          ]}
        >
          <Button
            title={`Continue as ${selectedRole}`}
            variant="primary"
            size="large"
            fullWidth
            onPress={handleContinueLogin}
            style={{ marginBottom: spacing.sm }}
          />
          <Button
            title="Create New Account"
            variant="outline"
            size="medium"
            fullWidth
            onPress={handleContinueRegister}
          />
        </View>
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        <View style={styles.introBlock}>
          <Text
            style={[
              styles.heading,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.xxl,
                fontWeight: typography.fontWeights.heavy,
              },
            ]}
          >
            Select Your Portal
          </Text>
          <Text
            style={[
              styles.subheading,
              {
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
                marginTop: spacing.xs,
              },
            ]}
          >
            Your selection determines your customized dashboard, controls, and workflows.
          </Text>
        </View>

        {/* Role Options */}
        <View style={styles.cardsContainer}>
          {ROLE_OPTIONS.map(option => {
            const isSelected = selectedRole === option.role;

            return (
              <TouchableOpacity
                key={option.role}
                activeOpacity={0.88}
                onPress={() => handleSelectRole(option.role)}
                style={[
                  styles.roleCard,
                  {
                    backgroundColor: isSelected ? colors.surface : colors.surfaceVariant,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                    borderRadius: borderRadius.lg,
                    padding: spacing.md,
                    marginBottom: spacing.md,
                  },
                ]}
              >
                {/* Header row in card */}
                <View style={styles.cardHeader}>
                  <View style={styles.iconAndBadge}>
                    <View
                      style={[
                        styles.iconCircle,
                        {
                          backgroundColor: isSelected
                            ? 'rgba(0, 229, 255, 0.15)'
                            : 'rgba(255, 255, 255, 0.05)',
                          borderRadius: borderRadius.full,
                        },
                      ]}
                    >
                      <Text style={styles.iconEmoji}>{option.icon}</Text>
                    </View>

                    <View
                      style={[
                        styles.roleBadge,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : 'rgba(148, 163, 184, 0.2)',
                          borderRadius: borderRadius.xs,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeLabel,
                          {
                            color: isSelected ? colors.textInverse : colors.textSecondary,
                            fontSize: typography.fontSizes.xs - 2,
                            fontWeight: typography.fontWeights.bold,
                          },
                        ]}
                      >
                        {option.badge}
                      </Text>
                    </View>
                  </View>

                  {/* Radio Indicator */}
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? colors.primary : colors.textMuted,
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {isSelected ? <View style={styles.radioDot} /> : null}
                  </View>
                </View>

                {/* Role Titles */}
                <Text
                  style={[
                    styles.roleTitle,
                    {
                      color: colors.textPrimary,
                      fontSize: typography.fontSizes.lg,
                      fontWeight: typography.fontWeights.bold,
                      marginTop: spacing.sm,
                    },
                  ]}
                >
                  {option.title}
                </Text>

                <Text
                  style={[
                    styles.roleSubtitle,
                    {
                      color: colors.textSecondary,
                      fontSize: typography.fontSizes.sm,
                      marginTop: spacing.xs,
                      lineHeight: 20,
                    },
                  ]}
                >
                  {option.subtitle}
                </Text>

                {/* Perk items */}
                <View style={[styles.perksList, { marginTop: spacing.sm + 4 }]}>
                  {option.perks.map((perk, pIdx) => (
                    <View key={pIdx} style={styles.perkRow}>
                      <Text style={[styles.perkCheck, { color: colors.primary }]}>✓</Text>
                      <Text
                        style={[
                          styles.perkText,
                          {
                            color: colors.textSecondary,
                            fontSize: typography.fontSizes.xs,
                            marginLeft: 6,
                          },
                        ]}
                      >
                        {perk}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  introBlock: {
    marginBottom: 20,
  },
  heading: {
    letterSpacing: -0.5,
  },
  subheading: {
    lineHeight: 20,
  },
  cardsContainer: {
    width: '100%',
  },
  roleCard: {
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconAndBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 22,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeLabel: {
    letterSpacing: 0.8,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0F172A',
  },
  roleTitle: {
    letterSpacing: -0.2,
  },
  roleSubtitle: {
    letterSpacing: 0,
  },
  perksList: {
    gap: 6,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  perkCheck: {
    fontSize: 12,
    fontWeight: '700',
  },
  perkText: {
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
  },
});
