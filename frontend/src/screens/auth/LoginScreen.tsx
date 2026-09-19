import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, UserRole } from '../../types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { DEMO_USERS } from '../../services/authService';
import { ScreenContainer, Button, Input, Header, Card } from '../../components/common';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;
type LoginScreenRouteProp = RouteProp<AuthStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
  route: LoginScreenRouteProp;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { role: contextRole, selectRole, login, isLoading, authError, clearError } = useAuth();

  const initialRole: UserRole = route.params?.role || contextRole || 'Customer';
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (route.params?.role) {
      setSelectedRole(route.params.role);
    }
  }, [route.params?.role]);

  // Sync role selection when changed
  const handleRoleChange = async (newRole: UserRole) => {
    setSelectedRole(newRole);
    await selectRole(newRole);
    clearError();
    setSubmitError(null);
  };

  // Quick fill with demo account for the chosen role
  const handleFillDemo = (roleKey: UserRole) => {
    handleRoleChange(roleKey);
    const demo = DEMO_USERS[roleKey];
    setEmail(demo.email);
    setPassword(demo.pass);
    setErrors({});
    setSubmitError(null);
  };

  const validate = (): boolean => {
    const errs: { email?: string; password?: string } = {};
    const emailTrim = email.trim();

    if (!emailTrim) {
      errs.email = 'Email address is required.';
    } else if (!emailTrim.includes('@') || !emailTrim.includes('.')) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    try {
      await login(email.trim(), password, selectedRole);
      // RootNavigator will automatically transition to role dashboard upon user state change
    } catch (err: any) {
      setSubmitError(err?.message || 'Invalid email or password.');
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Sign In"
          subtitle={`Access your ${selectedRole} account`}
          showBack
          onBackPress={() => navigation.navigate('RoleSelection')}
          transparent
        />
      }
      footer={
        <View
          style={[
            styles.footer,
            {
              borderTopColor: colors.border,
              backgroundColor: colors.surface,
              padding: spacing.md,
            },
          ]}
        >
          <View style={styles.footerRow}>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.sm }}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register', { role: selectedRole })}>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: typography.fontSizes.sm,
                  fontWeight: typography.fontWeights.bold,
                }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      }
    >
      <View style={[styles.content, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        {/* Active Role Selector Pill */}
        <Card
          variant="flat"
          padding="small"
          style={[styles.roleSwitchCard, { borderColor: colors.border }]}
        >
          <View style={styles.roleSwitchHeader}>
            <Text style={[styles.roleSwitchLabel, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
              PORTAL:
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('RoleSelection')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs, fontWeight: '700' }}>
                SWITCH ROLE
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.roleTabs}>
            {(['Customer', 'Provider', 'Admin'] as UserRole[]).map(r => {
              const isActive = selectedRole === r;
              return (
                <TouchableOpacity
                  key={r}
                  onPress={() => handleRoleChange(r)}
                  style={[
                    styles.roleTab,
                    {
                      backgroundColor: isActive ? colors.primary : 'transparent',
                      borderRadius: borderRadius.sm,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.roleTabText,
                      {
                        color: isActive ? colors.textInverse : colors.textSecondary,
                        fontSize: typography.fontSizes.xs,
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Global Error Banner (e.g. Invalid Credentials) */}
        {submitError || authError ? (
          <View
            style={[
              styles.errorBanner,
              {
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                borderColor: colors.danger,
                borderRadius: borderRadius.md,
                padding: spacing.sm + 2,
                marginBottom: spacing.md,
              },
            ]}
          >
            <Text style={[styles.errorBannerIcon, { color: colors.danger }]}>⚠️</Text>
            <Text
              style={[
                styles.errorBannerText,
                {
                  color: colors.danger,
                  fontSize: typography.fontSizes.xs + 1,
                  marginLeft: 8,
                  flex: 1,
                },
              ]}
            >
              {submitError || authError}
            </Text>
          </View>
        ) : null}

        {/* Form Inputs */}
        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="e.g. alex@example.com"
            value={email}
            onChangeText={text => {
              setEmail(text);
              if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              if (submitError) setSubmitError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
            leftIcon={<Text style={{ color: colors.textMuted }}>✉️</Text>}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={text => {
              setPassword(text);
              if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
              if (submitError) setSubmitError(null);
            }}
            isPassword
            autoCapitalize="none"
            error={errors.password}
            leftIcon={<Text style={{ color: colors.textMuted }}>🔒</Text>}
          />

          {/* Forgot Password Link */}
          <View style={styles.forgotPasswordRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword', { role: selectedRole })}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text
                style={[
                  styles.forgotText,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.fontSizes.xs + 1,
                    fontWeight: '600',
                  },
                ]}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <Button
            title={`Sign In as ${selectedRole}`}
            variant="primary"
            size="large"
            fullWidth
            loading={isLoading}
            onPress={handleLogin}
            style={{ marginTop: spacing.sm }}
          />
        </View>

        {/* Demo Fast Fill Section */}
        <View style={[styles.demoSection, { marginTop: spacing.xl }]}>
          <View style={styles.demoHeader}>
            <View style={[styles.demoLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.demoTitle, { color: colors.textMuted, fontSize: typography.fontSizes.xs }]}>
              QUICK DEMO ACCOUNTS
            </Text>
            <View style={[styles.demoLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.demoChips}>
            {(['Customer', 'Provider', 'Admin'] as UserRole[]).map(r => (
              <TouchableOpacity
                key={r}
                onPress={() => handleFillDemo(r)}
                style={[
                  styles.demoChip,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Text style={[styles.demoChipText, { color: colors.primary, fontSize: typography.fontSizes.xs }]}>
                  ⚡ Auto-Fill {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 20,
  },
  roleSwitchCard: {
    borderWidth: 1,
    marginBottom: 20,
  },
  roleSwitchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleSwitchLabel: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  roleTabs: {
    flexDirection: 'row',
    gap: 6,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTabText: {
    letterSpacing: 0.2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  errorBannerIcon: {
    fontSize: 16,
  },
  errorBannerText: {
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginBottom: 16,
    marginTop: -4,
  },
  forgotText: {
    textDecorationLine: 'underline',
  },
  demoSection: {
    width: '100%',
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  demoLine: {
    flex: 1,
    height: 1,
  },
  demoTitle: {
    marginHorizontal: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  demoChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  demoChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  demoChipText: {
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
