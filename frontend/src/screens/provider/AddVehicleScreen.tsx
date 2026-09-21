import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ProviderStackParamList,
  TransmissionType,
  VehicleAvailability,
  VehicleCategory,
  VehicleFuelType,
} from '../../types';
import { useTheme } from '../../theme';
import { useFleet } from '../../context/FleetContext';
import { ScreenContainer, Header, Card, Input, Button } from '../../components/common';

type AddVehicleNavProp = NativeStackNavigationProp<ProviderStackParamList, 'AddVehicle'>;

interface Props {
  navigation: AddVehicleNavProp;
}

const SAMPLE_PRESET_IMAGES = [
  { label: 'Tesla Model Y', url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=800' },
  { label: 'Mercedes C-Class', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800' },
  { label: 'BMW 3-Series', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800' },
  { label: 'Toyota RAV4', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800' },
  { label: 'Honda Civic', url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=800' },
];

const CATEGORIES: VehicleCategory[] = ['Economy', 'Sedan', 'SUV', 'Luxury'];
const TRANSMISSIONS: TransmissionType[] = ['Automatic', 'Manual'];
const FUELS: VehicleFuelType[] = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
const AVAILABILITIES: VehicleAvailability[] = ['Available', 'Maintenance', 'Archived'];

export const AddVehicleScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { addVehicle } = useFleet();

  // Form State
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2024');
  const [category, setCategory] = useState<VehicleCategory>('Sedan');
  const [imageUrl, setImageUrl] = useState(SAMPLE_PRESET_IMAGES[0].url);
  const [seats, setSeats] = useState('5');
  const [doors, setDoors] = useState('4');
  const [transmission, setTransmission] = useState<TransmissionType>('Automatic');
  const [fuel, setFuel] = useState<VehicleFuelType>('Petrol');
  const [mileage, setMileage] = useState('12500');
  const [location, setLocation] = useState('Central Depot & Hub West');
  const [features, setFeatures] = useState('Apple CarPlay, Adaptive Cruise, Leather Seats, Smart Key');
  const [description, setDescription] = useState(
    'Premium certified vehicle with flawless interior maintenance and complete active safety package.'
  );
  const [dailyPrice, setDailyPrice] = useState('75');
  const [weeklyPrice, setWeeklyPrice] = useState('460');
  const [securityDeposit, setSecurityDeposit] = useState('200');
  const [availability, setAvailabilityState] = useState<VehicleAvailability>('Available');
  const [isPublished, setIsPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!brand.trim()) errs.brand = 'Brand is required';
    if (!model.trim()) errs.model = 'Model is required';
    if (!dailyPrice || isNaN(Number(dailyPrice)) || Number(dailyPrice) <= 0) {
      errs.dailyPrice = 'Valid daily price is required';
    }
    if (!location.trim()) errs.location = 'Depot location is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please correct the highlighted fields before saving.');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedFeatures = features
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const created = await addVehicle({
        brand: brand.trim(),
        model: model.trim(),
        year: Number(year) || 2024,
        category,
        image: imageUrl.trim(),
        images: [imageUrl.trim()],
        seats: Number(seats) || 5,
        doors: Number(doors) || 4,
        transmission,
        fuel,
        mileage: Number(mileage) || 0,
        location: location.trim(),
        features: parsedFeatures.length > 0 ? parsedFeatures : ['Smart Key', 'Bluetooth Audio'],
        description: description.trim(),
        pricePerDay: Number(dailyPrice),
        weeklyPrice: Number(weeklyPrice) || Math.round(Number(dailyPrice) * 6.2),
        securityDeposit: Number(securityDeposit) || 200,
        availability,
        isPublished,
        rating: 5.0,
      });

      Alert.alert(
        'Vehicle Added',
        `${created.brand} ${created.model} has been saved to your fleet and ${
          isPublished ? 'is live for customer bookings!' : 'saved as draft.'
        }`,
        [
          {
            text: 'View Fleet',
            onPress: () => navigation.navigate('FleetList'),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to add vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="Add New Vehicle"
          subtitle="List vehicle into active fleet registry"
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
            title={isSubmitting ? 'Saving Vehicle...' : 'Publish to Fleet'}
            variant="primary"
            size="large"
            fullWidth
            loading={isSubmitting}
            onPress={handleSubmit}
          />
        </View>
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Basic Information Section */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.md }]}>
          Basic Vehicle Info
        </Text>

        <View style={styles.formRow}>
          <Input
            label="Brand / Make *"
            placeholder="e.g. Tesla, Toyota, BMW"
            value={brand}
            onChangeText={setBrand}
            error={errors.brand}
            containerStyle={{ flex: 1, marginRight: 8 }}
          />
          <Input
            label="Model *"
            placeholder="e.g. Model Y, Camry"
            value={model}
            onChangeText={setModel}
            error={errors.model}
            containerStyle={{ flex: 1 }}
          />
        </View>

        <View style={styles.formRow}>
          <Input
            label="Year *"
            placeholder="2024"
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
            containerStyle={{ flex: 1, marginRight: 8 }}
          />
          <Input
            label="Current Mileage (km)"
            placeholder="12500"
            value={mileage}
            onChangeText={setMileage}
            keyboardType="numeric"
            containerStyle={{ flex: 1 }}
          />
        </View>

        {/* Category Selector */}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category</Text>
        <View style={styles.choiceRow}>
          {CATEGORIES.map(cat => {
            const isSelected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={[
                  styles.choiceChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: borderRadius.md,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isSelected ? colors.textInverse : colors.textPrimary,
                    fontSize: 12,
                    fontWeight: isSelected ? '700' : '500',
                  }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Image Selection */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.md, marginTop: spacing.md }]}>
          Vehicle Image
        </Text>

        <Input
          label="Image URL"
          placeholder="https://..."
          value={imageUrl}
          onChangeText={setImageUrl}
        />

        {/* Presets preview */}
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Or choose quick sample photo:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {SAMPLE_PRESET_IMAGES.map((preset, pIdx) => (
            <TouchableOpacity
              key={pIdx}
              onPress={() => setImageUrl(preset.url)}
              style={[
                styles.presetThumbnailContainer,
                {
                  borderColor: imageUrl === preset.url ? colors.primary : colors.border,
                  borderRadius: borderRadius.md,
                  marginRight: 8,
                },
              ]}
            >
              <Image source={{ uri: preset.url }} style={styles.presetThumbnail} />
              <Text style={{ fontSize: 9, color: colors.textSecondary, marginTop: 2, textAlign: 'center' }}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Specifications */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.md, marginTop: spacing.sm }]}>
          Technical Specs
        </Text>

        <View style={styles.formRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Transmission</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {TRANSMISSIONS.map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTransmission(t)}
                  style={[
                    styles.choiceChip,
                    {
                      flex: 1,
                      backgroundColor: transmission === t ? colors.primary : colors.surfaceVariant,
                      borderColor: transmission === t ? colors.primary : colors.border,
                      borderRadius: borderRadius.sm,
                      paddingVertical: 8,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: transmission === t ? colors.textInverse : colors.textPrimary,
                      fontSize: 11,
                      fontWeight: '700',
                      textAlign: 'center',
                    }}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Fuel Type</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
              {FUELS.map(f => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFuel(f)}
                  style={[
                    styles.choiceChip,
                    {
                      backgroundColor: fuel === f ? colors.primary : colors.surfaceVariant,
                      borderColor: fuel === f ? colors.primary : colors.border,
                      borderRadius: borderRadius.sm,
                      paddingVertical: 6,
                      paddingHorizontal: 8,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: fuel === f ? colors.textInverse : colors.textPrimary,
                      fontSize: 10,
                      fontWeight: '700',
                    }}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={[styles.formRow, { marginTop: 12 }]}>
          <Input
            label="Passenger Seats"
            value={seats}
            onChangeText={setSeats}
            keyboardType="numeric"
            containerStyle={{ flex: 1, marginRight: 8 }}
          />
          <Input
            label="Doors"
            value={doors}
            onChangeText={setDoors}
            keyboardType="numeric"
            containerStyle={{ flex: 1 }}
          />
        </View>

        <Input
          label="Depot / Pick-up Location *"
          placeholder="e.g. Airport Terminal 1 - Hub West"
          value={location}
          onChangeText={setLocation}
          error={errors.location}
        />

        {/* Pricing Section */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.md, marginTop: spacing.sm }]}>
          Pricing & Security Deposit
        </Text>

        <View style={styles.formRow}>
          <Input
            label="Daily Rate ($) *"
            placeholder="75"
            value={dailyPrice}
            onChangeText={text => {
              setDailyPrice(text);
              const num = Number(text);
              if (!isNaN(num) && num > 0) {
                setWeeklyPrice(String(Math.round(num * 6.2)));
              }
            }}
            keyboardType="numeric"
            error={errors.dailyPrice}
            containerStyle={{ flex: 1, marginRight: 8 }}
          />
          <Input
            label="Weekly Rate ($)"
            placeholder="460"
            value={weeklyPrice}
            onChangeText={setWeeklyPrice}
            keyboardType="numeric"
            containerStyle={{ flex: 1 }}
          />
        </View>

        <Input
          label="Security Deposit ($)"
          placeholder="200"
          value={securityDeposit}
          onChangeText={setSecurityDeposit}
          keyboardType="numeric"
        />

        {/* Features and Description */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.md, marginTop: spacing.sm }]}>
          Features & Description
        </Text>

        <Input
          label="Features (comma-separated)"
          placeholder="Apple CarPlay, Sunroof, Backup Camera..."
          value={features}
          onChangeText={setFeatures}
          multiline
        />

        <Input
          label="Description"
          placeholder="Detailed vehicle condition and rental perks..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ minHeight: 60 }}
        />

        {/* Availability & Publishing Controls */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.md, marginTop: spacing.sm }]}>
          Operational Availability
        </Text>

        <View style={styles.choiceRow}>
          {AVAILABILITIES.map(status => {
            const isSelected = availability === status;
            return (
              <TouchableOpacity
                key={status}
                onPress={() => setAvailabilityState(status)}
                style={[
                  styles.choiceChip,
                  {
                    backgroundColor: isSelected ? colors.secondary : colors.surfaceVariant,
                    borderColor: isSelected ? colors.secondary : colors.border,
                    borderRadius: borderRadius.md,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isSelected ? '#FFFFFF' : colors.textPrimary,
                    fontSize: 12,
                    fontWeight: isSelected ? '700' : '500',
                  }}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Publish Immediately Switch */}
        <Card variant="flat" padding="medium" style={[styles.publishCard, { marginTop: spacing.md }]}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: typography.fontSizes.sm }}>
                Publish to Renter Discovery
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
                Makes this vehicle immediately searchable and bookable by customers in the app.
              </Text>
            </View>
            <Switch
              value={isPublished}
              onValueChange={setIsPublished}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  formRow: {
    flexDirection: 'row',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  choiceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  presetThumbnailContainer: {
    width: 90,
    borderWidth: 1.5,
    padding: 4,
    alignItems: 'center',
  },
  presetThumbnail: {
    width: 80,
    height: 50,
    borderRadius: 4,
  },
  publishCard: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerBar: {
    borderTopWidth: 1,
  },
});
