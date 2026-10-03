import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList, BookingCustomerDetails } from '../../../types';
import { useTheme } from '../../../theme';
import { useAuth } from '../../../context/AuthContext';
import { useBooking } from '../../../context/BookingContext';
import { ScreenContainer, Header, Card, Button, Input } from '../../../components/common';
import { BookingProgress } from '../../../components/booking';

type CustomerDetailsNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'CustomerDetails'
>;
type CustomerDetailsRouteProp = RouteProp<CustomerStackParamList, 'CustomerDetails'>;

interface CustomerDetailsProps {
  navigation: CustomerDetailsNavProp;
  route: CustomerDetailsRouteProp;
}

interface ValidationErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  cnic?: string;
}

const formatCNIC = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

export const CustomerDetailsScreen: React.FC<CustomerDetailsProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { vehicleId } = route.params;
  const { user } = useAuth();
  const { draft, setCustomerDetails } = useBooking();

  // Initialize with draft customer details or logged-in user profile
  const [fullName, setFullName] = useState<string>(
    draft?.customer?.fullName || user?.name || ''
  );
  const [phone, setPhone] = useState<string>(
    draft?.customer?.phone || user?.phone || '+92 300 1234567'
  );
  const [email, setEmail] = useState<string>(
    draft?.customer?.email || user?.email || ''
  );
  const [licenseNumber, setLicenseNumber] = useState<string>(
    draft?.customer?.licenseNumber || user?.licenseNumber || 'PK-LHR-2022-9841'
  );
  const [cnic, setCnic] = useState<string>(
    draft?.customer?.cnic || ''
  );
  const [notes, setNotes] = useState<string>(draft?.customer?.notes || '');

  const [errors, setErrors] = useState<ValidationErrors>({});

  const validate = (): boolean => {
    const errs: ValidationErrors = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      errs.fullName = 'Please enter your full legal name (minimum 3 characters)';
    }

    if (!phone.trim() || phone.trim().length < 8) {
      errs.phone = 'Please enter a valid mobile phone number';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!licenseNumber.trim() || licenseNumber.trim().length < 5) {
      errs.licenseNumber = 'Please enter a valid driving license ID number';
    }

    const cnicDigits = cnic.replace(/\D/g, '');
    if (!cnic.trim()) {
      errs.cnic = 'Please enter your CNIC number';
    } else if (cnicDigits.length !== 13) {
      errs.cnic = 'CNIC must be 13 digits (format: XXXXX-XXXXXXX-X)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceed = () => {
    if (!validate()) {
      return;
    }

    const customer: BookingCustomerDetails = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      licenseNumber: licenseNumber.trim(),
      cnic: cnic.trim(),
      notes: notes.trim(),
    };

    setCustomerDetails(customer);
    navigation.navigate('BookingPayment', { vehicleId });
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Customer Details"
          subtitle="Primary driver verification"
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
            title="Proceed to Payment →"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleProceed}
          />
        </View>
      }
    >
      <BookingProgress currentStep="details" />

      <ScrollView contentContainerStyle={[styles.content, { padding: spacing.md }]}>
        {/* Notice Card */}
        <Card
          variant="flat"
          padding="medium"
          style={[styles.noticeCard, { borderColor: colors.border, marginBottom: spacing.md }]}
        >
          <View style={styles.noticeRow}>
            <Text style={{ fontSize: 20, marginRight: 10 }}>🪪</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: typography.fontSizes.sm,
                  fontWeight: '700',
                }}
              >
                Driver Verification Notice
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.fontSizes.xs,
                  marginTop: 2,
                  lineHeight: 18,
                }}
              >
                Please ensure driver name matches your valid driving license. Digital key issuance requires verified identity.
              </Text>
            </View>
          </View>
        </Card>

        {/* Inputs */}
        <Input
          label="Full Legal Name *"
          placeholder="e.g. Muhammad Ahmed"
          value={fullName}
          onChangeText={val => {
            setFullName(val);
            if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
          }}
          error={errors.fullName}
          leftIcon={<Text style={{ fontSize: 16 }}>👤</Text>}
          autoCapitalize="words"
        />

        <Input
          label="Mobile Phone Number *"
          placeholder="e.g. +92 300 1234567"
          value={phone}
          onChangeText={val => {
            setPhone(val);
            if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
          }}
          error={errors.phone}
          keyboardType="phone-pad"
          leftIcon={<Text style={{ fontSize: 16 }}>📞</Text>}
        />

        <Input
          label="Email Address *"
          placeholder="e.g. ahmed@example.com"
          value={email}
          onChangeText={val => {
            setEmail(val);
            if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Text style={{ fontSize: 16 }}>✉️</Text>}
        />

        <Input
          label="Driving License ID / Number *"
          placeholder="e.g. PK-LHR-2022-9841"
          value={licenseNumber}
          onChangeText={val => {
            setLicenseNumber(val);
            if (errors.licenseNumber) setErrors(prev => ({ ...prev, licenseNumber: undefined }));
          }}
          error={errors.licenseNumber}
          autoCapitalize="characters"
          leftIcon={<Text style={{ fontSize: 16 }}>🪪</Text>}
        />

        <Input
          label="CNIC (National ID) *"
          placeholder="e.g. 35201-1234567-1"
          value={cnic}
          onChangeText={val => {
            const formatted = formatCNIC(val);
            setCnic(formatted);
            if (errors.cnic) setErrors(prev => ({ ...prev, cnic: undefined }));
          }}
          error={errors.cnic}
          keyboardType="number-pad"
          maxLength={15}
          leftIcon={<Text style={{ fontSize: 16 }}>🆔</Text>}
        />

        <Input
          label="Special Requests or Flight Number (Optional)"
          placeholder="e.g. Arriving on Flight PK-302, please hold car"
          value={notes}
          onChangeText={setNotes}
          leftIcon={<Text style={{ fontSize: 16 }}>📝</Text>}
        />

        {/* Security Assurance */}
        <View
          style={[
            styles.securityRow,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: borderRadius.md,
              marginTop: spacing.sm,
            },
          ]}
        >
          <Text style={{ fontSize: 18, marginRight: 10 }}>🔒</Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: typography.fontSizes.xs,
              flex: 1,
              lineHeight: 18,
            }}
          >
            Your information is encrypted with bank-grade 256-bit TLS protocols and will only be shared with the verified fleet hub host.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 28,
  },
  noticeCard: {
    borderWidth: 1,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
  },
  footerBar: {
    borderTopWidth: 1,
  },
});
