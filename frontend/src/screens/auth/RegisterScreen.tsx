import React, { useEffect, useState } from 'react';
import { Keyboard, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
}

const mapMessageToField = (msg: string): keyof FormErrors | null => {
  const lower = msg.toLowerCase();

  // Confirm password (must be checked before password so "confirm password" matches confirmPassword)
  if (lower.includes('confirm') || lower.includes('match')) {
    return 'confirmPassword';
  }

  // Password: check for password keywords or length requirements (e.g. "String should have at least 8 characters")
  if (
    lower.includes('password') ||
    lower.includes('8 character') ||
    lower.includes('8 char') ||
    lower.includes('at least 8') ||
    lower.includes('uppercase') ||
    lower.includes('lowercase') ||
    lower.includes('special character') ||
    lower.includes('digit')
  ) {
    return 'password';
  }

  // Email
  if (
    lower.includes('email') ||
    lower.includes('already exists') ||
    lower.includes('already registered') ||
    lower.includes('@')
  ) {
    return 'email';
  }

  // Full Name
  if (
    lower.includes('full name') ||
    lower.includes('fullname') ||
    lower.includes('letters, spaces') ||
    lower.includes('2 character') ||
    lower.includes('2 char') ||
    lower.includes('at least 2') ||
    lower.includes('name')
  ) {
    return 'name';
  }

  // Phone
  if (lower.includes('phone')) {
    return 'phone';
  }

  // Terms
  if (lower.includes('term') || lower.includes('condition') || lower.includes('privacy')) {
    return 'terms';
  }

  return null;
};

const mapBackendErrors = (err: any): FormErrors => {
  const result: FormErrors = {};

  // 1. Check if structured validation details exist (e.g., FastAPI / Pydantic 422 response)
  const detail = err?.data?.detail || err?.response?.data?.detail || err?.detail;

  if (Array.isArray(detail)) {
    for (const item of detail) {
      const msg = item?.msg || item?.message || (typeof item === 'string' ? item : 'Invalid value');
      const loc = Array.isArray(item?.loc) ? item.loc : [];
      const fieldKey = loc.length > 0 ? String(loc[loc.length - 1]).toLowerCase() : '';

      if (fieldKey.includes('password') || fieldKey.includes('pwd')) {
        result.password = msg;
      } else if (fieldKey === 'full_name' || fieldKey === 'name') {
        result.name = msg;
      } else if (fieldKey === 'email') {
        result.email = msg;
      } else if (fieldKey === 'phone_number' || fieldKey === 'phone') {
        result.phone = msg;
      } else if (fieldKey === 'confirm_password' || fieldKey === 'confirmpassword') {
        result.confirmPassword = msg;
      } else if (fieldKey === 'terms') {
        result.terms = msg;
      } else {
        const mapped = mapMessageToField(msg);
        if (mapped) {
          result[mapped] = msg;
        } else {
          result.general = result.general ? `${result.general}; ${msg}` : msg;
        }
      }
    }

    if (Object.keys(result).length > 0) {
      return result;
    }
  } else if (typeof detail === 'string' && detail.trim()) {
    const mapped = mapMessageToField(detail);
    if (mapped) {
      result[mapped] = detail;
    } else {
      result.general = detail;
    }
    return result;
  }

  // 2. Check if err.data has an errors object (e.g. { email: [...], password: [...] })
  const errorsObj = err?.data?.errors || err?.response?.data?.errors;
  if (errorsObj && typeof errorsObj === 'object' && !Array.isArray(errorsObj)) {
    for (const [k, v] of Object.entries(errorsObj)) {
      const keyLower = k.toLowerCase();
      const msg = Array.isArray(v) ? v.join(', ') : String(v);
      if (keyLower.includes('password')) result.password = msg;
      else if (keyLower === 'full_name' || keyLower === 'name') result.name = msg;
      else if (keyLower === 'email') result.email = msg;
      else if (keyLower.includes('phone')) result.phone = msg;
      else {
        const mapped = mapMessageToField(msg);
        if (mapped) result[mapped] = msg;
        else result.general = result.general ? `${result.general}; ${msg}` : msg;
      }
    }
    if (Object.keys(result).length > 0) {
      return result;
    }
  }

  // 3. Fallback: Parse err.message (which may contain semicolon-delimited messages from apiClient)
  const rawMessage = err?.message || 'Registration failed.';
  const parts = rawMessage.split(/;\s*/).map((p: string) => p.trim()).filter(Boolean);

  for (const part of parts) {
    const field = mapMessageToField(part);
    if (field) {
      result[field] = part;
    } else {
      result.general = result.general ? `${result.general}; ${part}` : part;
    }
  }

  if (Object.keys(result).length === 0) {
    result.general = rawMessage;
  }

  return result;
};

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
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleRoleChange = async (newRole: UserRole) => {
    setSelectedRole(newRole);
    await selectRole(newRole);
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
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
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    } else if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\/`~;]/.test(password)
    ) {
      errs.password = 'Password must contain uppercase, lowercase, digit, and special character.';
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

      navigation.navigate('OtpVerification', {
        email: email.trim(),
        phone: phone.trim() || undefined,
        role: selectedRole,
        fromScreen: 'Register',
      });
    } catch (err: any) {
      const fieldErrors = mapBackendErrors(err);
      setErrors(fieldErrors);
    }
  };

  return (
    <ScreenContainer
      scrollable
      scrollViewProps={{ automaticallyAdjustKeyboardInsets: true }}
      contentContainerStyle={{ paddingBottom: keyboardVisible ? 240 : 0 }}
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

        {/* Registration Inputs */}
        <View style={styles.form}>
          {errors.general ? (
            <View
              style={[
                styles.generalErrorBanner,
                {
                  backgroundColor: colors.danger + '18',
                  borderColor: colors.danger,
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <Text style={[styles.generalErrorText, { color: colors.danger, fontSize: typography.fontSizes.sm }]}>
                {errors.general}
              </Text>
            </View>
          ) : null}

          <Input
            label="Full Name *"
            placeholder="e.g. Jordan Smith"
            value={name}
            onChangeText={text => {
              setName(text);
              if (errors.name || errors.general) setErrors(prev => ({ ...prev, name: undefined, general: undefined }));
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
              if (errors.email || errors.general) setErrors(prev => ({ ...prev, email: undefined, general: undefined }));
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
              if (errors.phone || errors.general) setErrors(prev => ({ ...prev, phone: undefined, general: undefined }));
            }}
            keyboardType="phone-pad"
            error={errors.phone}
            leftIcon={<Text style={{ color: colors.textMuted }}>📱</Text>}
          />

          <Input
            label="Password *"
            placeholder="Min 8 characters"
            value={password}
            onChangeText={text => {
              setPassword(text);
              if (errors.password || errors.general) setErrors(prev => ({ ...prev, password: undefined, general: undefined }));
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
              if (errors.confirmPassword || errors.general) setErrors(prev => ({ ...prev, confirmPassword: undefined, general: undefined }));
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
              if (errors.terms || errors.general) setErrors(prev => ({ ...prev, terms: undefined, general: undefined }));
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
  form: {
    width: '100%',
  },
  generalErrorBanner: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  generalErrorText: {
    lineHeight: 18,
    fontWeight: '500',
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
