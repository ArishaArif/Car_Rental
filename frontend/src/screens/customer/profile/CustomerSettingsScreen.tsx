import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList, AppLanguage } from '../../../types';
import { useTheme } from '../../../theme';
import { ScreenContainer, Header, Card } from '../../../components/common';

type CustomerSettingsNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'CustomerSettings'
>;

interface CustomerSettingsProps {
  navigation: CustomerSettingsNavProp;
}

const LANGUAGES: { id: AppLanguage; label: string; sub: string }[] = [
  { id: 'English', label: 'English', sub: 'Default system language' },
  { id: 'Urdu', label: 'اردو', sub: 'Urdu Nastaliq' },
  { id: 'Roman Urdu', label: 'Roman Urdu', sub: 'Aasan Roman Urdu' },
];

export const CustomerSettingsScreen: React.FC<CustomerSettingsProps> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>('English');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [biometrics, setBiometrics] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'PKR'>('USD');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>('km');

  const handleSelectLanguage = (lang: AppLanguage) => {
    setSelectedLanguage(lang);
    Alert.alert('Language Updated', `Display language set to ${lang}. UI preferences saved.`);
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'A secure password reset link has been dispatched to your registered email address.',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Velox Mobility Privacy Policy',
      'Velox Mobility respects your privacy and adheres to regional data protection standards. Vehicle telematics data is encrypted and only monitored during active rentals for safety and roadside assistance.'
    );
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="App Settings"
          subtitle="Preferences & Security"
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <ScrollView contentContainerStyle={[styles.content, { padding: spacing.md }]}>
        {/* Language Selection */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginBottom: spacing.xs,
            },
          ]}
        >
          Language / زبان
        </Text>

        <Card variant="elevated" padding="small" style={{ borderColor: colors.border, borderRadius: borderRadius.md }}>
          {LANGUAGES.map(lang => {
            const isSelected = selectedLanguage === lang.id;
            return (
              <TouchableOpacity
                key={lang.id}
                activeOpacity={0.8}
                onPress={() => handleSelectLanguage(lang.id)}
                style={[
                  styles.settingRow,
                  {
                    backgroundColor: isSelected ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: borderRadius.sm,
                    padding: spacing.sm + 2,
                    marginBottom: 6,
                  },
                ]}
              >
                <Text style={{ fontSize: 16, marginRight: 10 }}>{isSelected ? '🔘' : '⚪'}</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: isSelected ? colors.primary : colors.textPrimary,
                      fontSize: typography.fontSizes.sm,
                      fontWeight: isSelected ? '700' : '500',
                    }}
                  >
                    {lang.label}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 1 }}>{lang.sub}</Text>
                </View>
                {isSelected ? (
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>ACTIVE</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* Notifications Section */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
              marginBottom: spacing.xs,
            },
          ]}
        >
          Notifications
        </Text>

        <Card variant="elevated" padding="medium" style={{ borderColor: colors.border, borderRadius: borderRadius.md }}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
                Push Notifications
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 1 }}>
                Important booking updates and lock status
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.textInverse}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 10 }]} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
                Rental Return Reminders
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 1 }}>
                Alert 2 hours prior to scheduled return
              </Text>
            </View>
            <Switch
              value={bookingAlerts}
              onValueChange={setBookingAlerts}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.textInverse}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 10 }]} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
                SMS Transaction Alerts
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 1 }}>
                Instant deposit and payment confirmations
              </Text>
            </View>
            <Switch
              value={smsAlerts}
              onValueChange={setSmsAlerts}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.textInverse}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 10 }]} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
                Promotions & Weekend Deals
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 1 }}>
                Discounts on luxury & SUV rentals
              </Text>
            </View>
            <Switch
              value={promoAlerts}
              onValueChange={setPromoAlerts}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.textInverse}
            />
          </View>
        </Card>

        {/* Security & Authentication */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
              marginBottom: spacing.xs,
            },
          ]}
        >
          Security & Credentials
        </Text>

        <Card variant="elevated" padding="medium" style={{ borderColor: colors.border, borderRadius: borderRadius.md }}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
                Biometric Login (FaceID / Fingerprint)
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 1 }}>
                Quick authorization for vehicle unlock
              </Text>
            </View>
            <Switch
              value={biometrics}
              onValueChange={setBiometrics}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.textInverse}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 10 }]} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
                Two-Factor Authentication (2FA)
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 1 }}>
                OTP required on new device sign in
              </Text>
            </View>
            <Switch
              value={twoFactor}
              onValueChange={setTwoFactor}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.textInverse}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 10 }]} />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleChangePassword}
            style={styles.actionRow}
          >
            <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' }}>
              🔑 Change Account Password
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>→</Text>
          </TouchableOpacity>
        </Card>

        {/* Privacy & App Preferences */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
              marginBottom: spacing.xs,
            },
          ]}
        >
          Privacy & Preferences
        </Text>

        <Card variant="elevated" padding="medium" style={{ borderColor: colors.border, borderRadius: borderRadius.md }}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
                Hub Location Services
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 1 }}>
                Find nearest mobility stations and parked cars
              </Text>
            </View>
            <Switch
              value={locationServices}
              onValueChange={setLocationServices}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.textInverse}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 10 }]} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
                Telemetry Diagnostics
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 1 }}>
                Share anonymous ride performance metrics
              </Text>
            </View>
            <Switch
              value={analytics}
              onValueChange={setAnalytics}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.textInverse}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 10 }]} />

          {/* Currency Preference */}
          <View style={styles.toggleRow}>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
              Currency
            </Text>
            <View style={styles.chipToggle}>
              {(['USD', 'PKR'] as const).map(curr => (
                <TouchableOpacity
                  key={curr}
                  onPress={() => setCurrency(curr)}
                  style={[
                    styles.chipBtn,
                    {
                      backgroundColor: currency === curr ? colors.primary : colors.surfaceVariant,
                      borderRadius: borderRadius.xs,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: currency === curr ? colors.textInverse : colors.textSecondary,
                      fontSize: 11,
                      fontWeight: '700',
                    }}
                  >
                    {curr}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 10 }]} />

          {/* Distance Units */}
          <View style={styles.toggleRow}>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
              Distance Units
            </Text>
            <View style={styles.chipToggle}>
              {(['km', 'mi'] as const).map(unit => (
                <TouchableOpacity
                  key={unit}
                  onPress={() => setDistanceUnit(unit)}
                  style={[
                    styles.chipBtn,
                    {
                      backgroundColor: distanceUnit === unit ? colors.primary : colors.surfaceVariant,
                      borderRadius: borderRadius.xs,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: distanceUnit === unit ? colors.textInverse : colors.textSecondary,
                      fontSize: 11,
                      fontWeight: '700',
                    }}
                  >
                    {unit.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 10 }]} />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePrivacyPolicy}
            style={styles.actionRow}
          >
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
              📜 View Privacy Policy
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>→</Text>
          </TouchableOpacity>
        </Card>

        {/* App Version Footer */}
        <View style={styles.versionFooter}>
          <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600' }}>
            Velox Mobility Client v2.4.0 (Build 8912)
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>
            Connected to Local Fleet State Engine
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
  },
  chipToggle: {
    flexDirection: 'row',
    gap: 6,
  },
  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  versionFooter: {
    alignItems: 'center',
    marginTop: 24,
  },
});
