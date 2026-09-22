import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList, SystemConfig } from '../../types';
import { useTheme } from '../../theme';
import { adminService } from '../../services/adminService';
import { ScreenContainer, Header, Card, Input, Button } from '../../components/common';

type AdminConfigNavProp = NativeStackNavigationProp<AdminStackParamList, 'AdminConfig'>;

interface Props {
  navigation: AdminConfigNavProp;
}

export const AdminConfigScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, spacing } = useTheme();
  const [config, setConfig] = useState<SystemConfig>(adminService.getConfig());
  const [commissionInput, setCommissionInput] = useState(config.commissionRate.toString());
  const [minDailyRateInput, setMinDailyRateInput] = useState(
    config.pricingBaseline.minDailyRate.toString()
  );
  const [defaultDepositInput, setDefaultDepositInput] = useState(
    config.pricingBaseline.defaultDeposit.toString()
  );
  const [peakMultiplierInput, setPeakMultiplierInput] = useState(
    config.pricingBaseline.peakMultiplierBaseline.toString()
  );

  // New Category input
  const [newCatName, setNewCatName] = useState('');
  const [newCatBasePrice, setNewCatBasePrice] = useState('60');

  // New Region input
  const [newRegName, setNewRegName] = useState('');
  const [newRegState, setNewRegState] = useState('');

  useEffect(() => {
    const unsubscribe = adminService.subscribe(() => {
      const updated = adminService.getConfig();
      setConfig(updated);
      setCommissionInput(updated.commissionRate.toString());
      setMinDailyRateInput(updated.pricingBaseline.minDailyRate.toString());
      setDefaultDepositInput(updated.pricingBaseline.defaultDeposit.toString());
      setPeakMultiplierInput(updated.pricingBaseline.peakMultiplierBaseline.toString());
    });
    return unsubscribe;
  }, []);

  const handleToggleCategory = (id: string) => {
    adminService.toggleCategory(id);
  };

  const handleToggleRegion = (id: string) => {
    adminService.toggleRegion(id);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) {
      Alert.alert('Category Name Required', 'Please enter a valid category name.');
      return;
    }
    const newCategory = {
      id: `cat-${Date.now().toString().slice(-4)}`,
      name: newCatName.trim(),
      isActive: true,
      basePrice: parseFloat(newCatBasePrice) || 50,
    };
    const updated = {
      ...config,
      vehicleCategories: [...config.vehicleCategories, newCategory],
    };
    adminService.updateConfig(updated);
    setNewCatName('');
    Alert.alert('Category Added', `Category "${newCategory.name}" has been enabled.`);
  };

  const handleAddRegion = () => {
    if (!newRegName.trim()) {
      Alert.alert('Region Name Required', 'Please enter a valid hub or city name.');
      return;
    }
    const newRegion = {
      id: `reg-${Date.now().toString().slice(-4)}`,
      name: newRegName.trim(),
      stateOrCountry: newRegState.trim() || 'USA',
      isActive: true,
    };
    const updated = {
      ...config,
      regions: [...config.regions, newRegion],
    };
    adminService.updateConfig(updated);
    setNewRegName('');
    setNewRegState('');
    Alert.alert('Region Added', `Operating hub "${newRegion.name}" added.`);
  };

  const handleSaveAll = () => {
    const commission = parseFloat(commissionInput) || 15;
    const minRate = parseFloat(minDailyRateInput) || 40;
    const deposit = parseFloat(defaultDepositInput) || 250;
    const peakMultiplier = parseFloat(peakMultiplierInput) || 1.25;

    adminService.setCommissionRate(commission);
    adminService.updatePricingBaseline({
      minDailyRate: minRate,
      defaultDeposit: deposit,
      peakMultiplierBaseline: peakMultiplier,
    });

    Alert.alert('Settings Saved', 'System configuration changes applied and active across platform.');
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="System Configuration"
          subtitle="Platform policies, fee schedules & geographic hubs"
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Section 1: Platform Commission Rate */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginBottom: 8,
            },
          ]}
        >
          1. Platform Commission Rate
        </Text>

        <Card variant="elevated" padding="medium" style={styles.sectionCard}>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            Standard take-rate percentage deducted from provider gross rental earnings:
          </Text>

          <View style={styles.inlineInputRow}>
            <View style={{ flex: 1 }}>
              <Input
                label="Commission Percentage (%)"
                keyboardType="numeric"
                value={commissionInput}
                onChangeText={setCommissionInput}
              />
            </View>
          </View>
        </Card>

        {/* Section 2: Vehicle Categories */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
              marginBottom: 8,
            },
          ]}
        >
          2. Vehicle Categories & Baseline
        </Text>

        <Card variant="elevated" padding="medium" style={styles.sectionCard}>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary, marginBottom: 10 }]}>
            Toggle active vehicle categories visible to renters during search:
          </Text>

          {config.vehicleCategories.map(cat => (
            <View key={cat.id} style={styles.toggleRow}>
              <View>
                <Text style={[styles.toggleName, { color: colors.textPrimary }]}>{cat.name}</Text>
                <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
                  Base: ${cat.basePrice}/day
                </Text>
              </View>

              <Switch
                value={cat.isActive}
                onValueChange={() => handleToggleCategory(cat.id)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={cat.isActive ? colors.textInverse : '#f4f3f4'}
              />
            </View>
          ))}

          {/* Add Category */}
          <View style={[styles.addBox, { borderTopColor: colors.border }]}>
            <Text style={[styles.addTitle, { color: colors.textPrimary }]}>
              + Add Custom Category
            </Text>
            <View style={styles.addInputs}>
              <Input
                placeholder="Category (e.g. Convertible)"
                value={newCatName}
                onChangeText={setNewCatName}
                containerStyle={{ flex: 2 }}
              />
              <Input
                placeholder="Base $"
                keyboardType="numeric"
                value={newCatBasePrice}
                onChangeText={setNewCatBasePrice}
                containerStyle={{ flex: 1, marginLeft: 8 }}
              />
            </View>
            <Button
              title="Add Category"
              variant="outline"
              size="small"
              onPress={handleAddCategory}
              style={{ marginTop: 8 }}
            />
          </View>
        </Card>

        {/* Section 3: Geographic Operating Regions */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
              marginBottom: 8,
            },
          ]}
        >
          3. Operating Hubs & Geographic Regions
        </Text>

        <Card variant="elevated" padding="medium" style={styles.sectionCard}>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary, marginBottom: 10 }]}>
            Enable or restrict rental depots and customer booking zones:
          </Text>

          {config.regions.map(reg => (
            <View key={reg.id} style={styles.toggleRow}>
              <View>
                <Text style={[styles.toggleName, { color: colors.textPrimary }]}>{reg.name}</Text>
                <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
                  📍 {reg.stateOrCountry}
                </Text>
              </View>

              <Switch
                value={reg.isActive}
                onValueChange={() => handleToggleRegion(reg.id)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={reg.isActive ? colors.textInverse : '#f4f3f4'}
              />
            </View>
          ))}

          {/* Add Region */}
          <View style={[styles.addBox, { borderTopColor: colors.border }]}>
            <Text style={[styles.addTitle, { color: colors.textPrimary }]}>
              + Add Operating Region
            </Text>
            <View style={styles.addInputs}>
              <Input
                placeholder="Hub Name (e.g. Phoenix Metro)"
                value={newRegName}
                onChangeText={setNewRegName}
                containerStyle={{ flex: 1 }}
              />
              <Input
                placeholder="State / Country"
                value={newRegState}
                onChangeText={setNewRegState}
                containerStyle={{ flex: 1, marginLeft: 8 }}
              />
            </View>
            <Button
              title="Add Region"
              variant="outline"
              size="small"
              onPress={handleAddRegion}
              style={{ marginTop: 8 }}
            />
          </View>
        </Card>

        {/* Section 4: Pricing Baseline */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginTop: spacing.lg,
              marginBottom: 8,
            },
          ]}
        >
          4. Global Pricing Baseline
        </Text>

        <Card variant="elevated" padding="medium" style={styles.sectionCard}>
          <Input
            label="Minimum Allowable Daily Rate ($)"
            keyboardType="numeric"
            value={minDailyRateInput}
            onChangeText={setMinDailyRateInput}
            containerStyle={{ marginBottom: 12 }}
          />

          <Input
            label="Standard Security Deposit Baseline ($)"
            keyboardType="numeric"
            value={defaultDepositInput}
            onChangeText={setDefaultDepositInput}
            containerStyle={{ marginBottom: 12 }}
          />

          <Input
            label="Peak Surge Multiplier Baseline (e.g. 1.25x)"
            keyboardType="numeric"
            value={peakMultiplierInput}
            onChangeText={setPeakMultiplierInput}
          />
        </Card>

        {/* Save Changes CTA */}
        <Button
          title="Save Configuration Changes"
          variant="primary"
          size="large"
          fullWidth
          onPress={handleSaveAll}
          style={{ marginTop: spacing.xl }}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  sectionCard: {
    borderWidth: 1,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 8,
  },
  inlineInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  toggleName: {
    fontSize: 13,
    fontWeight: '700',
  },
  toggleSub: {
    fontSize: 10,
    marginTop: 1,
  },
  addBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
  },
  addTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  addInputs: {
    flexDirection: 'row',
  },
});
