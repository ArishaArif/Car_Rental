import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer, Button, Input, Header, Card } from '../../components/common';

type ForgotPasswordNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;
type ForgotPasswordRouteProp = RouteProp<AuthStackParamList, 'ForgotPassword'>;

interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordNavigationProp;
  route: ForgotPasswordRouteProp;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { forgotPassword, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successSent, setSuccessSent] = useState(false);

  const validate = (): boolean => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setEmailError('Email address is required.');
      return false;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError(undefined);
    return true;
  };

  const handleSendInstructions = async () => {
    setSubmitError(null);
    if (!validate()) return;

    try {
      await forgotPassword(email.trim());
      setSuccessSent(true);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to process password reset.');
    }
  };

  const handleProceedToReset = () => {
    navigation.navigate('ResetPassword', { email: email.trim() });
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Reset Password"
          subtitle="Account recovery"
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
              Remember your password?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login', { role: route.params?.role })}>
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
        {/* Visual Header */}
        <Card variant="flat" padding="large" style={[styles.headerCard, { borderColor: colors.border }]}>
          <Text style={styles.headerEmoji}>🔐</Text>
          <Text
            style={[
              styles.heading,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.xl,
                fontWeight: typography.fontWeights.bold,
                marginTop: spacing.sm,
              },
            ]}
          >
            Forgot Your Password?
          </Text>
          <Text
            style={[
              styles.subtext,
              {
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
                marginTop: spacing.xs,
                textAlign: 'center',
                lineHeight: 20,
              },
            ]}
          >
            Enter your registered email address and we will initiate your password recovery process.
          </Text>
        </Card>

        {submitError ? (
          <View
            style={[
              styles.errorBanner,
              {
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                borderColor: colors.danger,
                borderRadius: borderRadius.md,
                padding: spacing.sm + 2,
                marginTop: spacing.md,
              },
            ]}
          >
            <Text style={{ color: colors.danger, fontWeight: '600' }}>⚠️ {submitError}</Text>
          </View>
        ) : null}

        {successSent ? (
          <View
            style={[
              styles.successCard,
              {
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                borderColor: colors.success,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                marginTop: spacing.md,
              },
            ]}
          >
            <Text style={[styles.successTitle, { color: colors.success, fontWeight: '700' }]}>
              ✓ Recovery Link Sent
            </Text>
            <Text
              style={[
                styles.successMessage,
                {
                  color: colors.textSecondary,
                  fontSize: typography.fontSizes.sm,
                  marginTop: spacing.xs,
                  lineHeight: 20,
                },
              ]}
            >
              We dispatched instructions to <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{email}</Text>.
              You can now proceed to set a new password.
            </Text>
            <Button
              title="Set New Password Now"
              variant="primary"
              size="medium"
              onPress={handleProceedToReset}
              style={{ marginTop: spacing.md }}
            />
          </View>
        ) : (
          <View style={[styles.form, { marginTop: spacing.md }]}>
            <Input
              label="Registered Email Address"
              placeholder="e.g. yourname@example.com"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (emailError) setEmailError(undefined);
                if (submitError) setSubmitError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={emailError}
              leftIcon={<Text style={{ color: colors.textMuted }}>✉️</Text>}
            />

            <Button
              title="Send Recovery Instructions"
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
              onPress={handleSendInstructions}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 20,
  },
  headerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerEmoji: {
    fontSize: 40,
  },
  heading: {
    letterSpacing: -0.2,
  },
  subtext: {
    paddingHorizontal: 8,
  },
  errorBanner: {
    borderWidth: 1,
  },
  successCard: {
    borderWidth: 1,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 16,
  },
  successMessage: {
    textAlign: 'center',
  },
  form: {
    width: '100%',
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
