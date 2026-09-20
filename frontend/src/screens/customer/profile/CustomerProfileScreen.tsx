import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../types';
import { useTheme } from '../../../theme';
import { useAuth } from '../../../context/AuthContext';
import { ScreenContainer, Header, Card, Button } from '../../../components/common';

type CustomerProfileNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'CustomerProfile'
>;

interface CustomerProfileProps {
  navigation: CustomerProfileNavProp;
}

export const CustomerProfileScreen: React.FC<CustomerProfileProps> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of your Velox account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const displayName = user?.name || 'Muhammad Ahmed';
  const displayEmail = user?.email || 'ahmed@example.com';
  const displayPhone = user?.phone || '+92 300 1234567';
  const displayCity = user?.city || 'Lahore, Pakistan';
  const displayLicense = user?.licenseNumber || 'PK-LHR-2021-9842';
  const displayExpiry = user?.licenseExpiry || '2028-11-30';
  const preferences = user?.preferences;

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Customer Profile"
          subtitle="Verified Renter Account"
          showBack
          onBackPress={() => navigation.goBack()}
          rightElement={
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('CustomerSettings')}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <Text style={{ fontSize: 16 }}>⚙️</Text>
            </TouchableOpacity>
          }
        />
      }
      footer={
        <View
          style={[
            styles.footerBar,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              padding: spacing.md,
            },
          ]}
        >
          <Button
            title="Edit Profile"
            variant="primary"
            size="large"
            onPress={() => navigation.navigate('EditProfile')}
            style={{ flex: 1, marginRight: 8 }}
          />

          <Button
            title="Sign Out"
            variant="danger"
            size="large"
            onPress={handleLogout}
            style={{ flex: 1 }}
          />
        </View>
      }
    >
      <ScrollView contentContainerStyle={[styles.content, { padding: spacing.md }]}>
        {/* User Badge Hero Card */}
        <Card
          variant="elevated"
          padding="medium"
          style={[
            styles.userHeroCard,
            {
              borderColor: colors.primary,
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
            },
          ]}
        >
          <View style={styles.avatarRow}>
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: 'rgba(0, 229, 255, 0.15)',
                  borderColor: colors.primary,
                  borderRadius: borderRadius.full,
                },
              ]}
            >
              <Text style={styles.avatarEmoji}>{user?.avatarUrl || '🚗'}</Text>
            </View>

            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.lg,
                  fontWeight: typography.fontWeights.bold,
                }}
              >
                {displayName}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
                {displayEmail}
              </Text>
              <View
                style={[
                  styles.verifiedBadge,
                  {
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    borderColor: colors.accent,
                    borderRadius: borderRadius.xs,
                  },
                ]}
              >
                <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '800' }}>
                  ✓ VERIFIED DRIVER
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Quick Hub Navigation Cards */}
        <View style={[styles.quickNavRow, { marginTop: spacing.md }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MyBookings')}
            style={[
              styles.navCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Text style={{ fontSize: 20 }}>📑</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700', marginTop: 4 }}>
              My Bookings
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 9 }}>Reservations & past trips</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ActiveRental')}
            style={[
              styles.navCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Text style={{ fontSize: 20 }}>🔑</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700', marginTop: 4 }}>
              Active Rental
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 9 }}>Keyless live dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CustomerSettings')}
            style={[
              styles.navCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <Text style={{ fontSize: 20 }}>⚙️</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700', marginTop: 4 }}>
              Settings
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 9 }}>Language & security</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
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
          Personal Information
        </Text>

        <Card variant="elevated" padding="medium" style={{ borderColor: colors.border, borderRadius: borderRadius.md }}>
          <View style={styles.infoRow}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Full Legal Name</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
              {displayName}
            </Text>
          </View>
          <View style={[styles.infoRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Email Address</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
              {displayEmail}
            </Text>
          </View>
          <View style={[styles.infoRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Phone Number</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
              {displayPhone}
            </Text>
          </View>
          <View style={[styles.infoRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Residential City</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
              {displayCity}
            </Text>
          </View>
        </Card>

        {/* Driver's License Information */}
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
          Driving License Details
        </Text>

        <Card variant="elevated" padding="medium" style={{ borderColor: colors.border, borderRadius: borderRadius.md }}>
          <View style={styles.infoRow}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>License Number</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' }}>
              {displayLicense}
            </Text>
          </View>
          <View style={[styles.infoRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Issuing Authority</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
              Traffic Police / NADRA Verification
            </Text>
          </View>
          <View style={[styles.infoRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>License Expiry</Text>
            <Text style={{ color: colors.accent, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' }}>
              {displayExpiry} (Active)
            </Text>
          </View>
        </Card>

        {/* Saved Rental Preferences */}
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
          Saved Preferences
        </Text>

        <Card variant="elevated" padding="medium" style={{ borderColor: colors.border, borderRadius: borderRadius.md }}>
          <View style={styles.infoRow}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>App Language</Text>
            <Text style={{ color: colors.primary, fontSize: typography.fontSizes.xs + 1, fontWeight: '700' }}>
              {preferences?.language || 'English'}
            </Text>
          </View>
          <View style={[styles.infoRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Preferred Class</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
              {preferences?.preferredCategory || 'SUV & Luxury'}
            </Text>
          </View>
          <View style={[styles.infoRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Preferred Transmission</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
              {preferences?.preferredTransmission || 'Automatic'}
            </Text>
          </View>
          <View style={[styles.infoRow, { marginTop: 8 }]}>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.xs }}>Currency</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.xs + 1, fontWeight: '600' }}>
              {preferences?.currency || 'USD ($)'}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  userHeroCard: {
    borderWidth: 1.5,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  verifiedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    marginTop: 6,
  },
  quickNavRow: {
    flexDirection: 'row',
    gap: 8,
  },
  navCard: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
    textAlign: 'center',
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
});
