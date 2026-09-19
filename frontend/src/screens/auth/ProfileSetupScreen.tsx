import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, UserRole } from '../../types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer, Button, Input, Header, Card } from '../../components/common';

type ProfileSetupScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ProfileSetup'
>;
type ProfileSetupScreenRouteProp = RouteProp<AuthStackParamList, 'ProfileSetup'>;

interface ProfileSetupScreenProps {
  navigation: ProfileSetupScreenNavigationProp;
  route: ProfileSetupScreenRouteProp;
}

const AVATAR_OPTIONS = ['🏎️', '⚡', '👑', '🛡️', '💼', '🚀'];

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  route,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { user, updateProfile, isLoading } = useAuth();

  const role: UserRole = route.params?.role || user?.role || 'Customer';

  // State
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [city, setCity] = useState(user?.city || 'San Francisco, CA');
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [fleetSize, setFleetSize] = useState(user?.fleetSize || '10-25 Vehicles');
  const [department, setDepartment] = useState(user?.department || 'System Operations');

  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const errs: typeof errors = {};

    if (!city.trim()) {
      errs.city = 'Location / City is required.';
    }

    if (role === 'Customer') {
      if (!licenseNumber.trim()) {
        errs.licenseNumber = "Driver's license ID is required for vehicle verification.";
      }
    } else if (role === 'Provider') {
      if (!businessName.trim()) {
        errs.businessName = 'Fleet or Business Name is required.';
      }
    } else if (role === 'Admin') {
      if (!department.trim()) {
        errs.department = 'Department name is required.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = async () => {
    setSubmitError(null);
    if (!validate()) return;

    try {
      await updateProfile({
        city: city.trim(),
        avatarUrl: selectedAvatar,
        role,
        ...(role === 'Customer' ? { licenseNumber: licenseNumber.trim() } : {}),
        ...(role === 'Provider'
          ? { businessName: businessName.trim(), fleetSize: fleetSize.trim() }
          : {}),
        ...(role === 'Admin' ? { department: department.trim() } : {}),
      });

      // Successful profile update will automatically trigger RootNavigator to route to the role-based dashboard!
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to complete profile setup.');
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Complete Profile"
          subtitle={`${role} setup & verification`}
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
            title="Complete Setup & Launch"
            variant="primary"
            size="large"
            fullWidth
            loading={isLoading}
            onPress={handleSaveProfile}
          />
        </View>
      }
    >
      <View style={[styles.content, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        {/* Avatar Selection Card */}
        <Card variant="flat" padding="medium" style={[styles.avatarCard, { borderColor: colors.border }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textSecondary, fontSize: typography.fontSizes.xs },
            ]}
          >
            CHOOSE PROFILE BADGE
          </Text>

          <View style={styles.avatarRow}>
            {AVATAR_OPTIONS.map(emoji => {
              const isSelected = selectedAvatar === emoji;
              return (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => setSelectedAvatar(emoji)}
                  style={[
                    styles.avatarBtn,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected
                        ? 'rgba(0, 229, 255, 0.15)'
                        : colors.surfaceVariant,
                      borderRadius: borderRadius.full,
                    },
                  ]}
                >
                  <Text style={styles.avatarEmoji}>{emoji}</Text>
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

        {/* Common Details Form */}
        <View style={[styles.form, { marginTop: spacing.lg }]}>
          <Input
            label="Location / Primary City *"
            placeholder="e.g. San Francisco, CA"
            value={city}
            onChangeText={text => {
              setCity(text);
              if (errors.city) setErrors(prev => ({ ...prev, city: undefined }));
            }}
            error={errors.city}
            leftIcon={<Text style={{ color: colors.textMuted }}>📍</Text>}
          />

          {/* Role-Specific Fields */}
          {role === 'Customer' && (
            <View>
              <Input
                label="Driver's License Number *"
                placeholder="e.g. DL-98341829"
                value={licenseNumber}
                onChangeText={text => {
                  setLicenseNumber(text);
                  if (errors.licenseNumber) setErrors(prev => ({ ...prev, licenseNumber: undefined }));
                }}
                error={errors.licenseNumber}
                helperText="Required for instant vehicle insurance & smart unlock"
                leftIcon={<Text style={{ color: colors.textMuted }}>🪪</Text>}
              />
            </View>
          )}

          {role === 'Provider' && (
            <View>
              <Input
                label="Fleet or Business Entity Name *"
                placeholder="e.g. Apex Luxury Mobility LLC"
                value={businessName}
                onChangeText={text => {
                  setBusinessName(text);
                  if (errors.businessName) setErrors(prev => ({ ...prev, businessName: undefined }));
                }}
                error={errors.businessName}
                leftIcon={<Text style={{ color: colors.textMuted }}>🏢</Text>}
              />

              <Input
                label="Approximate Fleet Size"
                placeholder="e.g. 5-15 Vehicles"
                value={fleetSize}
                onChangeText={setFleetSize}
                helperText="Can be adjusted anytime in the fleet manager"
                leftIcon={<Text style={{ color: colors.textMuted }}>🚗</Text>}
              />
            </View>
          )}

          {role === 'Admin' && (
            <View>
              <Input
                label="Department & Security Level *"
                placeholder="e.g. Security & Platform Operations"
                value={department}
                onChangeText={text => {
                  setDepartment(text);
                  if (errors.department) setErrors(prev => ({ ...prev, department: undefined }));
                }}
                error={errors.department}
                leftIcon={<Text style={{ color: colors.textMuted }}>🛡️</Text>}
              />
            </View>
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
  avatarCard: {
    borderWidth: 1,
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  avatarBtn: {
    width: 48,
    height: 48,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  errorBanner: {
    borderWidth: 1,
  },
  form: {
    width: '100%',
  },
  footer: {
    borderTopWidth: 1,
  },
});
