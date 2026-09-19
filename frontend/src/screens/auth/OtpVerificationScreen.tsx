import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer, Button, Header, Card } from '../../components/common';

type OtpVerificationScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'OtpVerification'
>;
type OtpVerificationScreenRouteProp = RouteProp<AuthStackParamList, 'OtpVerification'>;

interface OtpVerificationScreenProps {
  navigation: OtpVerificationScreenNavigationProp;
  route: OtpVerificationScreenRouteProp;
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { verifyOtp, resendOtp, isLoading } = useAuth();

  const { email, phone, role, fromScreen } = route.params;

  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  // 30-second countdown for OTP resend
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async () => {
    setErrorMsg(null);
    setResendNotice(null);

    const cleanCode = otp.trim();
    if (cleanCode.length !== 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    try {
      await verifyOtp(email, cleanCode);

      if (fromScreen === 'ForgotPassword') {
        navigation.replace('ResetPassword', { email });
      } else {
        // Successful registration verification -> proceed to Profile Setup
        navigation.replace('ProfileSetup', { role });
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid verification code. Use demo code 123456.');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      setErrorMsg(null);
      const res = await resendOtp(email);
      setResendNotice(res.message);
      setCountdown(30);
      setCanResend(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to resend code.');
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Verify Code"
          subtitle="Confirm your identity"
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
          <Button
            title="Verify & Continue"
            variant="primary"
            size="large"
            fullWidth
            loading={isLoading}
            onPress={handleVerify}
          />
        </View>
      }
    >
      <View style={[styles.content, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        {/* Info Card */}
        <Card variant="elevated" padding="medium" style={styles.infoCard}>
          <Text style={styles.cardEmoji}>✉️</Text>
          <Text
            style={[
              styles.infoTitle,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.lg,
                fontWeight: typography.fontWeights.bold,
                marginTop: spacing.xs,
              },
            ]}
          >
            Security Code Sent
          </Text>
          <Text
            style={[
              styles.infoText,
              {
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
                marginTop: spacing.xs,
                textAlign: 'center',
              },
            ]}
          >
            We sent a 6-digit confirmation code to:
          </Text>
          <Text
            style={[
              styles.emailHighlight,
              {
                color: colors.primary,
                fontSize: typography.fontSizes.md,
                fontWeight: typography.fontWeights.bold,
                marginTop: 4,
              },
            ]}
          >
            {email}
          </Text>
          {phone ? (
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
              and SMS to {phone}
            </Text>
          ) : null}
        </Card>

        {/* Demo Hint Banner */}
        <View
          style={[
            styles.hintBanner,
            {
              backgroundColor: colors.surfaceVariant,
              borderColor: colors.border,
              borderRadius: borderRadius.md,
              marginTop: spacing.md,
            },
          ]}
        >
          <Text style={[styles.hintText, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
            💡 Prototype Testing Code:{' '}
            <Text style={{ color: colors.primary, fontWeight: '700' }}>123456</Text>
          </Text>
          <TouchableOpacity onPress={() => setOtp('123456')} style={styles.fillCodeBtn}>
            <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs, fontWeight: '700' }}>
              Quick Fill
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications & Error feedback */}
        {resendNotice ? (
          <View
            style={[
              styles.noticeBox,
              {
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                borderColor: colors.success,
                borderRadius: borderRadius.md,
                marginTop: spacing.sm,
              },
            ]}
          >
            <Text style={{ color: colors.success, fontSize: typography.fontSizes.xs, fontWeight: '600' }}>
              ✓ {resendNotice}
            </Text>
          </View>
        ) : null}

        {errorMsg ? (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                borderColor: colors.danger,
                borderRadius: borderRadius.md,
                marginTop: spacing.sm,
              },
            ]}
          >
            <Text style={{ color: colors.danger, fontSize: typography.fontSizes.xs, fontWeight: '600' }}>
              ⚠️ {errorMsg}
            </Text>
          </View>
        ) : null}

        {/* Code Input Box */}
        <View style={[styles.inputSection, { marginTop: spacing.lg }]}>
          <Text
            style={[
              styles.inputLabel,
              {
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
                fontWeight: typography.fontWeights.medium,
                marginBottom: 8,
              },
            ]}
          >
            ENTER 6-DIGIT CODE
          </Text>

          <TextInput
            style={[
              styles.otpInput,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: errorMsg ? colors.danger : colors.primary,
                color: colors.textPrimary,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSizes.xxl,
                letterSpacing: 12,
              },
            ]}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={text => {
              setOtp(text.replace(/[^0-9]/g, ''));
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="······"
            placeholderTextColor={colors.textMuted}
            textAlign="center"
            autoFocus
          />
        </View>

        {/* Resend Code Section */}
        <View style={[styles.resendContainer, { marginTop: spacing.xl }]}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} style={styles.resendBtn}>
              <Text
                style={[
                  styles.resendActiveText,
                  {
                    color: colors.primary,
                    fontSize: typography.fontSizes.sm,
                    fontWeight: typography.fontWeights.bold,
                  },
                ]}
              >
                ↻ Resend Code
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.resendTimerText, { color: colors.textMuted, fontSize: typography.fontSizes.sm }]}>
              Resend available in <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{countdown}s</Text>
            </Text>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  infoCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  cardEmoji: {
    fontSize: 38,
  },
  infoTitle: {
    letterSpacing: -0.2,
  },
  infoText: {
    lineHeight: 20,
  },
  emailHighlight: {
    letterSpacing: 0.3,
  },
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  hintText: {
    fontWeight: '500',
  },
  fillCodeBtn: {
    padding: 4,
  },
  noticeBox: {
    padding: 10,
    borderWidth: 1,
  },
  errorBox: {
    padding: 10,
    borderWidth: 1,
  },
  inputSection: {
    alignItems: 'center',
  },
  inputLabel: {
    letterSpacing: 1,
  },
  otpInput: {
    width: '100%',
    height: 58,
    borderWidth: 1.5,
    fontWeight: '700',
  },
  resendContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendBtn: {
    padding: 8,
  },
  resendActiveText: {
    textDecorationLine: 'underline',
  },
  resendTimerText: {
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
  },
});
