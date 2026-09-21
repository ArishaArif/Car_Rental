import React, { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Header, ScreenContainer } from '../../../components/common';
import { useBooking } from '../../../context/BookingContext';
import { useTheme } from '../../../theme';
import {
  CustomerStackParamList,
  DamageFinding,
} from '../../../types';

type AIDamageReportNavProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'AIDamageReport'
>;
type AIDamageReportRouteProp = RouteProp<
  CustomerStackParamList,
  'AIDamageReport'
>;

interface AIDamageReportScreenProps {
  navigation: AIDamageReportNavProp;
  route: AIDamageReportRouteProp;
}

export const AIDamageReportScreen: React.FC<AIDamageReportScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, typography, borderRadius } = useTheme();
  const { inspectionResult, bookingId } = route.params;
  const { bookings, completeReturn } = useBooking();

  const [isFinalizing, setIsFinalizing] = useState(false);

  const booking = bookings.find(b => b.id === bookingId);
  const vehicle = booking?.vehicle;

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'Severe':
        return '#EF4444';
      case 'Moderate':
        return '#F59E0B';
      case 'Minor':
        return '#3B82F6';
      case 'None':
      default:
        return '#10B981';
    }
  };

  const handleFinalizeReturn = async () => {
    setIsFinalizing(true);
    try {
      // Use existing bookingContext completeReturn so the existing invoice pipeline is reused!
      await completeReturn(bookingId, {
        exteriorCondition:
          inspectionResult.overallCondition === 'Passed - No Damage'
            ? 'Good'
            : inspectionResult.overallCondition === 'Needs Minor Repair'
            ? 'Minor Scratches'
            : 'Damaged',
        interiorCondition: 'Clean',
        fuelLevel: 95,
        odometerReading: (booking?.pickupMileage || 14200) + 180,
        generalNotes: `AI Inspection Ref: ${inspectionResult.inspectionId}. Status: ${inspectionResult.overallCondition}. Billable repair estimate: PKR ${inspectionResult.totalEstimatedCost.toLocaleString()}`,
        inspectionPassed: inspectionResult.totalEstimatedCost === 0,
        inspectedAt: new Date().toISOString(),
      });

      setIsFinalizing(false);
      // Seamlessly navigate to existing FinalInvoice screen!
      navigation.navigate('FinalInvoice', { bookingId });
    } catch {
      setIsFinalizing(false);
      Alert.alert('Error', 'Could not finalize return. Please try again.');
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <Header
          title="AI Damage Report"
          subtitle={`Report #${inspectionResult.inspectionId}`}
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
      footer={
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Button
            title={isFinalizing ? 'Finalizing Return...' : 'Proceed to Final Invoice →'}
            onPress={handleFinalizeReturn}
            disabled={isFinalizing}
            fullWidth
          />
        </View>
      }
    >
      {/* Explicit Prototype Label */}
      <View style={[styles.prototypeNotice, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
        <Text style={styles.noticeIcon}>ℹ️</Text>
        <View style={styles.noticeContent}>
          <Text style={[styles.noticeTitle, { color: '#92400E' }]}>
            LOCAL PROTOTYPE AI REPORT
          </Text>
          <Text style={[styles.noticeText, { color: '#B45309' }]}>
            {inspectionResult.disclaimer}
          </Text>
        </View>
      </View>

      {/* High-Level Diagnostic Summary Card */}
      <Card variant="elevated" style={styles.summaryCard}>
        <View style={styles.summaryTopRow}>
          <View>
            <Text style={[styles.summaryVehicle, { color: colors.textPrimary, fontSize: typography.fontSizes.md }]}>
              {vehicle?.brand} {vehicle?.model}
            </Text>
            <Text style={[styles.summaryTime, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
              Analyzed at: {new Date(inspectionResult.analyzedAt).toLocaleTimeString()}
            </Text>
          </View>

          <View
            style={[
              styles.conditionBadge,
              {
                backgroundColor:
                  inspectionResult.totalEstimatedCost === 0 ? '#10B98120' : '#EF444420',
                borderColor:
                  inspectionResult.totalEstimatedCost === 0 ? '#10B981' : '#EF4444',
              },
            ]}
          >
            <Text
              style={[
                styles.conditionText,
                {
                  color:
                    inspectionResult.totalEstimatedCost === 0 ? '#10B981' : '#EF4444',
                },
              ]}
            >
              {inspectionResult.overallCondition}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Cost Tally */}
        <View style={styles.costRow}>
          <Text style={[styles.costLabel, { color: colors.textSecondary, fontSize: typography.fontSizes.sm }]}>
            Estimated Repair Assessment:
          </Text>
          <Text
            style={[
              styles.costAmount,
              {
                color: inspectionResult.totalEstimatedCost > 0 ? '#EF4444' : colors.primary,
                fontSize: typography.fontSizes.lg,
              },
            ]}
          >
            PKR {inspectionResult.totalEstimatedCost.toLocaleString()}
          </Text>
        </View>
      </Card>

      {/* Itemized Findings */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.sm }]}>
          DETECTED SURFACE ANOMALIES ({inspectionResult.findings.length})
        </Text>
      </View>

      {inspectionResult.findings.map((finding: DamageFinding, idx: number) => {
        const severityColor = getSeverityBadgeColor(finding.severity);

        return (
          <Card key={finding.id || `finding-${idx}`} variant="outlined" style={styles.findingCard}>
            <View style={styles.findingHeader}>
              <View style={styles.findingTitleBlock}>
                <Text style={[styles.findingType, { color: colors.textPrimary, fontSize: typography.fontSizes.md }]}>
                  {finding.damageType}
                </Text>
                <Text style={[styles.findingLocation, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
                  Location: {finding.location} ({finding.category} view)
                </Text>
              </View>

              <View style={[styles.severityBadge, { backgroundColor: severityColor + '20', borderColor: severityColor }]}>
                <Text style={[styles.severityText, { color: severityColor }]}>
                  {finding.severity.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Evidence Image */}
            <Image source={{ uri: finding.evidenceImageUrl }} style={styles.evidenceImage} />

            {/* Confidence & Estimated Cost Breakdown */}
            <View style={[styles.metaRow, { backgroundColor: colors.background, borderRadius: borderRadius.sm }]}>
              <View>
                <Text style={[styles.metaLabel, { color: colors.textSecondary, fontSize: 10 }]}>
                  AI CONFIDENCE
                </Text>
                <Text style={[styles.metaValue, { color: colors.textPrimary, fontSize: typography.fontSizes.xs }]}>
                  {Math.round(finding.confidence * 100)}% Match
                </Text>
              </View>

              <View style={styles.metaRight}>
                <Text style={[styles.metaLabel, { color: colors.textSecondary, fontSize: 10 }]}>
                  ESTIMATED REPAIR
                </Text>
                <Text style={[styles.metaValue, { color: colors.primary, fontSize: typography.fontSizes.sm, fontWeight: '800' }]}>
                  PKR {finding.estimatedRepairCost.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Diagnostic notes */}
            <Text style={[styles.findingNotes, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
              🔬 Diagnostics: {finding.notes}
            </Text>
          </Card>
        );
      })}
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
  summaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryVehicle: {
    fontWeight: '800',
  },
  summaryTime: {
    marginTop: 2,
  },
  conditionBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  conditionText: {
    fontSize: 11,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontWeight: '600',
  },
  costAmount: {
    fontWeight: '900',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  findingCard: {
    padding: 12,
    marginBottom: 12,
  },
  findingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  findingTitleBlock: {
    flex: 1,
  },
  findingType: {
    fontWeight: '800',
  },
  findingLocation: {
    marginTop: 2,
  },
  severityBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '800',
  },
  evidenceImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 8,
  },
  metaRight: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontWeight: '700',
  },
  findingNotes: {
    lineHeight: 18,
  },
});
