import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer, Button, Input, Header, Card } from '../../components/common';

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ResetPassword'
>;
type ResetPasswordScreenRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

interface ResetPasswordScreenProps {
  navigation: ResetPasswordScreenNavigationProp;
  route: ResetPasswordScreenRouteProp;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { resetPassword, isLoading } = useAuth();

  const { email } = route.params;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const errs: typeof errors = {};

    if (!newPassword) {
      errs.newPassword = 'New password is required.';
    } else if (newPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirmation password is required.';
    } else if (confirmPassword !== newPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleResetPassword = async () => {
    setSubmitError(null);
    if (!validate()) return;

    try {
      await resetPassword(email, newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      setSubmitError(err?.message || 'Password reset failed.');
    }
  };

  const handleReturnToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Create New Password"
          subtitle="Secure your account"
          showBack
          onBackPress={() => navigation.goBack()}
          transparent
        />
      }
      footer={
        isSuccess ? (
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
            <Button
              title="Proceed to Sign In"
              variant="primary"
              size="large"
              fullWidth
              onPress={handleReturnToLogin}
            />
          </View>
        ) : undefined
      }
    >
      <View style={[styles.content, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        {isSuccess ? (
          <Card
            variant="elevated"
            padding="large"
            style={[styles.successCard, { borderColor: colors.success }]}
          >
            <Text style={styles.successIcon}>🎉</Text>
            <Text
              style={[
                styles.successTitle,
                {
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.xl,
                  fontWeight: typography.fontWeights.heavy,
                  marginTop: spacing.sm,
                },
              ]}
            >
              Password Reset Complete!
            </Text>
            <Text
              style={[
                styles.successDescription,
                {
                  color: colors.textSecondary,
                  fontSize: typography.fontSizes.sm,
                  marginTop: spacing.xs,
                  textAlign: 'center',
                  lineHeight: 22,
                },
              ]}
            >
              Your password for <Text style={{ color: colors.primary, fontWeight: '600' }}>{email}</Text> has been
              successfully updated. You can now log in with your new credentials.
            </Text>
          </Card>
        ) : (
          <>
            <Card variant="flat" padding="medium" style={[styles.infoBanner, { borderColor: colors.border }]}>
              <Text
                style={[
                  styles.infoBannerText,
                  { color: colors.textSecondary, fontSize: typography.fontSizes.sm },
                ]}
              >
                Resetting password for:{' '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>{email}</Text>
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
                    marginVertical: spacing.sm,
                  },
                ]}
              >
                <Text style={{ color: colors.danger, fontWeight: '600' }}>⚠️ {submitError}</Text>
              </View>
            ) : null}

            <View style={[styles.form, { marginTop: spacing.md }]}>
              <Input
                label="New Password"
                placeholder="Enter at least 6 characters"
                value={newPassword}
                onChangeText={text => {
                  setNewPassword(text);
                  if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: undefined }));
                }}
                isPassword
                autoCapitalize="none"
                error={errors.newPassword}
                leftIcon={<Text style={{ color: colors.textMuted }}>🔒</Text>}
              />

              <Input
                label="Confirm New Password"
                placeholder="Re-enter new password"
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

              <Button
                title="Update Password"
                variant="primary"
                size="large"
                fullWidth
                loading={isLoading}
                onPress={handleResetPassword}
                style={{ marginTop: spacing.md }}
              />
            </View>
          </>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 20,
  },
  infoBanner: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBannerText: {
    fontWeight: '500',
  },
  errorBanner: {
    borderWidth: 1,
  },
  form: {
    width: '100%',
  },
  successCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    paddingVertical: 32,
    marginTop: 20,
  },
  successIcon: {
    fontSize: 48,
  },
  successTitle: {
    letterSpacing: -0.3,
  },
  successDescription: {
    paddingHorizontal: 8,
  },
  footer: {
    borderTopWidth: 1,
  },
});
