import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, UserRole } from '../../types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer, Button, Input, Header, Card } from '../../components/common';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;
type RegisterScreenRouteProp = RouteProp<AuthStackParamList, 'Register'>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
  route: RegisterScreenRouteProp;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { role: contextRole, selectRole, register, isLoading } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>(route.params?.role || contextRole || 'Customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleRoleChange = async (newRole: UserRole) => {
    setSelectedRole(newRole);
    await selectRole(newRole);
  };

  const validate = (): boolean => {
    const errs: typeof errors = {};
    const nameTrim = name.trim();
    const emailTrim = email.trim();

    if (!nameTrim) {
      errs.name = 'Full name is required.';
    }

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

    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword !== password) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      errs.terms = 'You must accept the terms & conditions.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    setSubmitError(null);
    if (!validate()) {
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        role: selectedRole,
      });

      // Proceed to OTP verification with user contact info
      navigation.navigate('OtpVerification', {
        email: email.trim(),
        phone: phone.trim() || undefined,
        role: selectedRole,
        fromScreen: 'Register',
      });
    } catch (err: any) {
      setSubmitError(err?.message || 'Registration failed.');
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Create Account"
          subtitle={`Register as ${selectedRole}`}
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
              borderTopColor: colors.border,
              backgroundColor: colors.surface,
              padding: spacing.md,
            },
          ]}
        >
          <View style={styles.footerRow}>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.sm }}>
              Already registered?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login', { role: selectedRole })}>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: typography.fontSizes.sm,
                  fontWeight: typography.fontWeights.bold,
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      }
    >
      <View style={[styles.content, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        {/* Role Segmented Selector */}
        <Card variant="flat" padding="small" style={[styles.roleCard, { borderColor: colors.border }]}>
          <Text
            style={[
              styles.roleCardLabel,
              { color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginBottom: 6 },
            ]}
          >
            ACCOUNT TYPE:
          </Text>
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

        {submitError ? (
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
            <Text style={{ color: colors.danger, fontWeight: '600' }}>⚠️ {submitError}</Text>
          </View>
        ) : null}

        {/* Registration Inputs */}
        <View style={styles.form}>
          <Input
            label="Full Name *"
            placeholder="e.g. Jordan Smith"
            value={name}
            onChangeText={text => {
              setName(text);
              if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
            }}
            error={errors.name}
            leftIcon={<Text style={{ color: colors.textMuted }}>👤</Text>}
          />

          <Input
            label="Email Address *"
            placeholder="e.g. jordan@example.com"
            value={email}
            onChangeText={text => {
              setEmail(text);
              if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
            leftIcon={<Text style={{ color: colors.textMuted }}>✉️</Text>}
          />

          <Input
            label="Phone Number (Optional)"
            placeholder="e.g. +1 (555) 019-2834"
            value={phone}
            onChangeText={text => {
              setPhone(text);
              if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
            }}
            keyboardType="phone-pad"
            error={errors.phone}
            leftIcon={<Text style={{ color: colors.textMuted }}>📱</Text>}
          />

          <Input
            label="Password *"
            placeholder="Min 6 characters"
            value={password}
            onChangeText={text => {
              setPassword(text);
              if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
            }}
            isPassword
            autoCapitalize="none"
            error={errors.password}
            leftIcon={<Text style={{ color: colors.textMuted }}>🔒</Text>}
          />

          <Input
            label="Confirm Password *"
            placeholder="Repeat password"
            value={confirmPassword}
            onChangeText={text => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
            }}
            isPassword
            autoCapitalize="none"
            error={errors.confirmPassword}
            leftIcon={<Text style={{ color: colors.textMuted }}>🛡️</Text>}
          />

          {/* Terms checkbox */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setAgreeTerms(!agreeTerms);
              if (errors.terms) setErrors(prev => ({ ...prev, terms: undefined }));
            }}
            style={styles.termsRow}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: errors.terms ? colors.danger : colors.primary,
                  backgroundColor: agreeTerms ? colors.primary : 'transparent',
                  borderRadius: borderRadius.xs,
                },
              ]}
            >
              {agreeTerms ? (
                <Text style={{ color: colors.textInverse, fontSize: 11, fontWeight: '700' }}>✓</Text>
              ) : null}
            </View>
            <Text style={[styles.termsText, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
              I agree to the <Text style={{ color: colors.primary }}>Terms of Service</Text> and{' '}
              <Text style={{ color: colors.primary }}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {errors.terms ? (
            <Text style={{ color: colors.danger, fontSize: typography.fontSizes.xs, marginTop: 4 }}>
              {errors.terms}
            </Text>
          ) : null}

          <Button
            title="Create & Verify Account"
            variant="primary"
            size="large"
            fullWidth
            loading={isLoading}
            onPress={handleRegister}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 20,
  },
  roleCard: {
    borderWidth: 1,
    marginBottom: 16,
  },
  roleCardLabel: {
    fontWeight: '700',
    letterSpacing: 0.8,
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
    borderWidth: 1,
  },
  form: {
    width: '100%',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  termsText: {
    flex: 1,
    lineHeight: 18,
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
