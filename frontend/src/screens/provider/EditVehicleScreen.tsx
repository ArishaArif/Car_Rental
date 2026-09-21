import React, { useState, useEffect } from 'react';
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
import { RouteProp } from '@react-navigation/native';
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

type EditVehicleNavProp = NativeStackNavigationProp<ProviderStackParamList, 'EditVehicle'>;
type EditVehicleRouteProp = RouteProp<ProviderStackParamList, 'EditVehicle'>;

interface Props {
  navigation: EditVehicleNavProp;
  route: EditVehicleRouteProp;
}

const CATEGORIES: VehicleCategory[] = ['Economy', 'Sedan', 'SUV', 'Luxury'];
const TRANSMISSIONS: TransmissionType[] = ['Automatic', 'Manual'];
const FUELS: VehicleFuelType[] = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
const AVAILABILITIES: VehicleAvailability[] = [
  'Available',
  'Booked',
  'Active Rental',
  'Maintenance',
  'Archived',
];

export const EditVehicleScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { vehicleId } = route.params;
  const { vehicles, editVehicle } = useFleet();

  const vehicle = vehicles.find(v => v.id === vehicleId);

  // Form State prefilled
  const [brand, setBrand] = useState(vehicle?.brand || '');
  const [model, setModel] = useState(vehicle?.model || '');
  const [year, setYear] = useState(String(vehicle?.year || 2024));
  const [category, setCategory] = useState<VehicleCategory>(vehicle?.category || 'Sedan');
  const [imageUrl, setImageUrl] = useState(vehicle?.image || '');
  const [seats, setSeats] = useState(String(vehicle?.seats || 5));
  const [doors, setDoors] = useState(String(vehicle?.doors || 4));
  const [transmission, setTransmission] = useState<TransmissionType>(
    vehicle?.transmission || 'Automatic'
  );
  const [fuel, setFuel] = useState<VehicleFuelType>(vehicle?.fuel || 'Petrol');
  const [mileage, setMileage] = useState(String(vehicle?.mileage || 15000));
  const [location, setLocation] = useState(vehicle?.location || '');
  const [features, setFeatures] = useState(vehicle?.features.join(', ') || '');
  const [description, setDescription] = useState(vehicle?.description || '');
  const [dailyPrice, setDailyPrice] = useState(String(vehicle?.pricePerDay || 75));
  const [weeklyPrice, setWeeklyPrice] = useState(String(vehicle?.weeklyPrice || 460));
  const [securityDeposit, setSecurityDeposit] = useState(String(vehicle?.securityDeposit || 200));
  const [availability, setAvailabilityState] = useState<VehicleAvailability>(
    vehicle?.availability || 'Available'
  );
  const [isPublished, setIsPublished] = useState(
    vehicle?.isPublished !== undefined ? vehicle.isPublished : true
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!vehicle) {
    return (
      <ScreenContainer
        header={
          <Header
            title="Vehicle Not Found"
            showBack
            onBackPress={() => navigation.goBack()}
          />
        }
      >
        <View style={{ padding: spacing.xl, alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>
            Vehicle with ID {vehicleId} could not be located.
          </Text>
          <Button
            title="Return to Fleet"
            onPress={() => navigation.goBack()}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </ScreenContainer>
    );
  }

  const handleSubmit = async () => {
    if (!brand.trim() || !model.trim() || !dailyPrice || Number(dailyPrice) <= 0) {
      Alert.alert('Validation Error', 'Please complete required brand, model, and daily rate fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedFeatures = features
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      await editVehicle(vehicle.id, {
        brand: brand.trim(),
        model: model.trim(),
        year: Number(year) || vehicle.year,
        category,
        image: imageUrl.trim() || vehicle.image,
        images: [imageUrl.trim() || vehicle.image],
        seats: Number(seats) || 5,
        doors: Number(doors) || 4,
        transmission,
        fuel,
        mileage: Number(mileage) || vehicle.mileage,
        location: location.trim() || vehicle.location,
        features: parsedFeatures.length > 0 ? parsedFeatures : vehicle.features,
        description: description.trim() || vehicle.description,
        pricePerDay: Number(dailyPrice),
        weeklyPrice: Number(weeklyPrice) || Math.round(Number(dailyPrice) * 6.2),
        securityDeposit: Number(securityDeposit) || 200,
        availability,
        isPublished,
      });

      Alert.alert('Changes Saved', `${brand} ${model} details updated successfully!`, [
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title={`Edit ${vehicle.brand} ${vehicle.model}`}
          subtitle="Update vehicle specifications and pricing"
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
            title={isSubmitting ? 'Saving...' : 'Save Changes'}
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
        <View style={styles.formRow}>
          <Input
            label="Brand / Make *"
            value={brand}
            onChangeText={setBrand}
            containerStyle={{ flex: 1, marginRight: 8 }}
          />
          <Input
            label="Model *"
            value={model}
            onChangeText={setModel}
            containerStyle={{ flex: 1 }}
          />
        </View>

        <View style={styles.formRow}>
          <Input
            label="Year *"
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
            containerStyle={{ flex: 1, marginRight: 8 }}
          />
          <Input
            label="Odometer Mileage (km)"
            value={mileage}
            onChangeText={setMileage}
            keyboardType="numeric"
            containerStyle={{ flex: 1 }}
          />
        </View>

        {/* Category */}
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

        <Input label="Image URL" value={imageUrl} onChangeText={setImageUrl} />

        {/* Specs */}
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
          label="Depot Location *"
          value={location}
          onChangeText={setLocation}
        />

        {/* Pricing */}
        <View style={styles.formRow}>
          <Input
            label="Daily Rate ($) *"
            value={dailyPrice}
            onChangeText={setDailyPrice}
            keyboardType="numeric"
            containerStyle={{ flex: 1, marginRight: 8 }}
          />
          <Input
            label="Weekly Rate ($)"
            value={weeklyPrice}
            onChangeText={setWeeklyPrice}
            keyboardType="numeric"
            containerStyle={{ flex: 1 }}
          />
        </View>

        <Input
          label="Security Deposit ($)"
          value={securityDeposit}
          onChangeText={setSecurityDeposit}
          keyboardType="numeric"
        />

        <Input
          label="Features (comma-separated)"
          value={features}
          onChangeText={setFeatures}
          multiline
        />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        {/* Availability */}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: spacing.sm }]}>
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

        {/* Publish Switch */}
        <Card variant="flat" padding="medium" style={{ marginTop: spacing.md, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: typography.fontSizes.sm }}>
                Publish to Renter App
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginTop: 2 }}>
                Visible in Customer search and booking flows.
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
  footerBar: {
    borderTopWidth: 1,
  },
});
