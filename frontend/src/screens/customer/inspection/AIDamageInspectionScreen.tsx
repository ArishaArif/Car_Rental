import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Header, ScreenContainer } from '../../../components/common';
import { useBooking } from '../../../context/BookingContext';
import { damageDetectionService } from '../../../services/damageDetectionService';
import { useTheme } from '../../../theme';
import {
  CapturedPhoto,
  CustomerStackParamList,
  PhotoCategory,
} from '../../../types';

type AIDamageInspectionNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'AIDamageInspection'
>;
type AIDamageInspectionRouteProp = RouteProp<
  CustomerStackParamList,
  'AIDamageInspection'
>;

interface AIDamageInspectionScreenProps {
  navigation: AIDamageInspectionNavProp;
  route: AIDamageInspectionRouteProp;
}

const CATEGORIES: PhotoCategory[] = [
  'Front',
  'Rear',
  'Left',
  'Right',
  'Interior',
  'Dashboard',
];

export const AIDamageInspectionScreen: React.FC<AIDamageInspectionScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, borderRadius } = useTheme();
  const { bookingId } = route.params;
  const { bookings } = useBooking();

  const booking = bookings.find(b => b.id === bookingId);
  const vehicle = booking?.vehicle;

  const defaultTemplates = damageDetectionService.getDefaultPhotoTemplates();

  // Pre-load all 6 photo angles with default mock photo reference images
  const [capturedPhotos] = useState<Record<PhotoCategory, CapturedPhoto>>(() => {
    const initial: any = {};
    CATEGORIES.forEach(cat => {
      initial[cat] = {
        category: cat,
        uri: defaultTemplates[cat].mockUri,
        capturedAt: new Date().toISOString(),
        label: defaultTemplates[cat].title,
      };
    });
    return initial;
  });

  const [selectedScenario, setSelectedScenario] = useState<
    'Clean' | 'MinorDamage' | 'ModerateDamage' | 'SevereDamage'
  >('MinorDamage');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');

  const handleRetakePhoto = (category: PhotoCategory) => {
    Alert.alert(
      `Capture ${category} Angle`,
      'Camera hardware integration is disabled in prototype mode. The simulated inspection image has been refreshed.',
      [{ text: 'OK' }]
    );
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisStep('Uploading multi-angle photo assets...');

    setTimeout(() => {
      setAnalysisStep('Running simulated edge detection & neural diagnostics...');
    }, 600);

    setTimeout(() => {
      setAnalysisStep('Calculating estimated surface repair costs & billable items...');
    }, 1200);

    try {
      const photosList = Object.values(capturedPhotos);
      const result = await damageDetectionService.analyzePhotos(
        bookingId,
        vehicle?.id || 'veh-default',
        photosList,
        selectedScenario
      );

      setIsAnalyzing(false);
      navigation.navigate('AIDamageReport', {
        inspectionResult: result,
        bookingId,
      });
    } catch {
      setIsAnalyzing(false);
      Alert.alert('Analysis Failed', 'Could not complete simulated inspection. Please try again.');
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="AI Damage Inspection"
          subtitle="Multi-angle automated diagnostics"
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
      footer={
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Button
            title={isAnalyzing ? 'Running AI Scan...' : 'Start AI Analysis →'}
            onPress={handleRunAnalysis}
            disabled={isAnalyzing}
            fullWidth
          />
        </View>
      }
    >
      {/* Prototype Notice Banner */}
      <View style={[styles.prototypeNotice, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
        <Text style={styles.noticeIcon}>⚠️</Text>
        <View style={styles.noticeContent}>
          <Text style={[styles.noticeTitle, { color: '#92400E' }]}>
            AI PROTOTYPE SIMULATION
          </Text>
          <Text style={[styles.noticeText, { color: '#B45309' }]}>
            This module demonstrates an API-ready AI damage inspection workflow using local mock computer vision diagnostics.
          </Text>
        </View>
      </View>

      {/* Target Vehicle Summary */}
      {vehicle && (
        <Card variant="outlined" style={styles.vehicleCard}>
          <View style={styles.vehicleHeader}>
            <Image source={{ uri: vehicle.image }} style={styles.vehicleThumb} />
            <View style={styles.vehicleInfo}>
              <Text style={[styles.vehicleName, { color: colors.textPrimary, fontSize: typography.fontSizes.md }]}>
                {vehicle.brand} {vehicle.model} ({vehicle.year})
              </Text>
              <Text style={[styles.vehicleMeta, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
                Booking Ref: {bookingId} • Hub Return Check
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Test Scenario Preset Picker */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.sm }]}>
          SELECT TEST SCENARIO
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
          Choose outcome to simulate AI computer vision detection
        </Text>
      </View>

      <View style={styles.scenarioGrid}>
        {(
          [
            { id: 'Clean', label: 'Clean (No Damage)', icon: '🟢' },
            { id: 'MinorDamage', label: 'Minor Scratch', icon: '🟡' },
            { id: 'ModerateDamage', label: 'Moderate Dent', icon: '🟠' },
            { id: 'SevereDamage', label: 'Severe Glass Crack', icon: '🔴' },
          ] as const
        ).map(sc => {
          const isSelected = selectedScenario === sc.id;
          return (
            <TouchableOpacity
              key={sc.id}
              activeOpacity={0.8}
              onPress={() => setSelectedScenario(sc.id)}
              style={[
                styles.scenarioChip,
                {
                  backgroundColor: isSelected ? colors.primary + '14' : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <Text style={styles.scenarioIcon}>{sc.icon}</Text>
              <Text
                style={[
                  styles.scenarioLabel,
                  {
                    color: isSelected ? colors.primary : colors.textPrimary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {sc.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 6 Required Photo Categories */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.sm }]}>
          REQUIRED PHOTO ANGLES (6/6 READY)
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
          All reference angles loaded for computer vision evaluation
        </Text>
      </View>

      <View style={styles.photosGrid}>
        {CATEGORIES.map(category => {
          const template = defaultTemplates[category];
          const captured = capturedPhotos[category];

          return (
            <Card key={category} variant="outlined" style={styles.photoCard}>
              <View style={styles.photoHeader}>
                <Text style={[styles.categoryTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.sm }]}>
                  {category} Angle
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: '#10B981' + '20' }]}>
                  <Text style={[styles.statusText, { color: '#10B981' }]}>✓ Ready</Text>
                </View>
              </View>

              <Image source={{ uri: captured.uri }} style={styles.angleImage} />

              <Text style={[styles.photoHint, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
                {template.hint}
              </Text>

              <TouchableOpacity
                onPress={() => handleRetakePhoto(category)}
                style={[styles.retakeBtn, { borderColor: colors.border, borderRadius: borderRadius.sm }]}
              >
                <Text style={[styles.retakeBtnText, { color: colors.primary }]}>
                  📷 Retake Angle
                </Text>
              </TouchableOpacity>
            </Card>
          );
        })}
      </View>

      {/* Scanning Overlay Modal or State */}
      {isAnalyzing && (
        <View style={styles.scanningOverlay}>
          <View style={[styles.scanningBox, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.scanningTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.md }]}>
              AI Surface Scan in Progress
            </Text>
            <Text style={[styles.scanningStep, { color: colors.textSecondary, fontSize: typography.fontSizes.sm }]}>
              {analysisStep}
            </Text>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  prototypeNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  noticeIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  noticeText: {
    fontSize: 11,
    lineHeight: 16,
  },
  vehicleCard: {
    marginBottom: 16,
    padding: 12,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleThumb: {
    width: 60,
    height: 45,
    borderRadius: 6,
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontWeight: '700',
  },
  vehicleMeta: {
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    marginTop: 2,
  },
  scenarioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  scenarioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '48%',
  },
  scenarioIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  scenarioLabel: {
    fontSize: 12,
  },
  photosGrid: {
    gap: 12,
    marginBottom: 20,
  },
  photoCard: {
    padding: 12,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  angleImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    marginBottom: 8,
  },
  photoHint: {
    lineHeight: 16,
    marginBottom: 8,
  },
  retakeBtn: {
    borderWidth: 1,
    paddingVertical: 6,
    alignItems: 'center',
  },
  retakeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scanningBox: {
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  scanningTitle: {
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 6,
  },
  scanningStep: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
