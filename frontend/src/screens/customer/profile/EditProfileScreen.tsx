import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../types';
import { useTheme } from '../../../theme';
import { useAuth } from '../../../context/AuthContext';
import { ScreenContainer, Header, Card, Button, Input } from '../../../components/common';

type EditProfileNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'EditProfile'
>;

interface EditProfileProps {
  navigation: EditProfileNavProp;
}

export const EditProfileScreen: React.FC<EditProfileProps> = ({ navigation }) => {
  const { colors, spacing, borderRadius } = useTheme();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || 'Muhammad Ahmed');
  const [phone, setPhone] = useState(user?.phone || '+92 300 1234567');
  const [city, setCity] = useState(user?.city || 'Lahore');
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber || 'PK-LHR-2021-9842');
  const [licenseExpiry, setLicenseExpiry] = useState(user?.licenseExpiry || '2028-11-30');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Full Name is required.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Phone Number is required.');
      return;
    }
    if (!licenseNumber.trim()) {
      Alert.alert('Validation Error', 'Driving License Number is required.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        licenseNumber: licenseNumber.trim(),
        licenseExpiry: licenseExpiry.trim(),
      });
      Alert.alert('Profile Updated', 'Your customer profile has been saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Save Failed', err?.message || 'Could not update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Edit Profile"
          subtitle="Update Driver Credentials"
          showBack
          onBackPress={() => navigation.goBack()}
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
            title="Cancel"
            variant="secondary"
            size="large"
            onPress={() => navigation.goBack()}
            style={{ flex: 1, marginRight: 8 }}
          />

          <Button
            title={saving ? 'Saving Changes...' : 'Save Changes'}
            variant="primary"
            size="large"
            loading={saving}
            onPress={handleSave}
            style={{ flex: 1.8 }}
          />
        </View>
      }
    >
      <ScrollView contentContainerStyle={[styles.content, { padding: spacing.md }]}>
        <Card variant="elevated" padding="medium" style={{ borderColor: colors.border, borderRadius: borderRadius.md }}>
          <Input
            label="Full Legal Name"
            value={name}
            onChangeText={setName}
            placeholder="Muhammad Ahmed"
          />

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="+92 300 1234567"
            keyboardType="phone-pad"
            containerStyle={{ marginTop: spacing.md }}
          />

          <Input
            label="Residential City"
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Lahore, Islamabad, Karachi"
            containerStyle={{ marginTop: spacing.md }}
          />

          <Input
            label="Driver's License Number"
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            placeholder="PK-LHR-2021-9842"
            containerStyle={{ marginTop: spacing.md }}
          />

          <Input
            label="License Expiry Date (YYYY-MM-DD)"
            value={licenseExpiry}
            onChangeText={setLicenseExpiry}
            placeholder="2028-11-30"
            containerStyle={{ marginTop: spacing.md }}
            helperText="Required for vehicle insurance verification"
          />
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
});
