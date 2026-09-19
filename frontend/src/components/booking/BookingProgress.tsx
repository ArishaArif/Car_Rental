import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export type BookingStep = 'dates' | 'location' | 'summary' | 'details' | 'payment';

interface StepMeta {
  key: BookingStep;
  label: string;
  stepNumber: number;
}

const STEPS: StepMeta[] = [
  { key: 'dates', label: 'Dates', stepNumber: 1 },
  { key: 'location', label: 'Location', stepNumber: 2 },
  { key: 'summary', label: 'Summary', stepNumber: 3 },
  { key: 'details', label: 'Driver', stepNumber: 4 },
  { key: 'payment', label: 'Payment', stepNumber: 5 },
];

interface BookingProgressProps {
  currentStep: BookingStep;
}

export const BookingProgress: React.FC<BookingProgressProps> = ({ currentStep }) => {
  const { colors, typography, borderRadius } = useTheme();

  const currentIndex = STEPS.findIndex(s => s.key === currentStep);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.stepsRow}>
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          let circleBg = colors.surfaceVariant;
          let circleBorder = colors.border;
          let circleTextColor = colors.textMuted;

          if (isCompleted) {
            circleBg = colors.accent;
            circleBorder = colors.accent;
            circleTextColor = '#FFFFFF';
          } else if (isCurrent) {
            circleBg = colors.primary;
            circleBorder = colors.primary;
            circleTextColor = colors.textInverse;
          }

          return (
            <React.Fragment key={step.key}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.circle,
                    {
                      backgroundColor: circleBg,
                      borderColor: circleBorder,
                      borderRadius: borderRadius.full,
                    },
                  ]}
                >
                  <Text style={[styles.circleText, { color: circleTextColor, fontSize: typography.fontSizes.xs - 2 }]}>
                    {isCompleted ? '✓' : step.stepNumber}
                  </Text>
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.stepLabel,
                    {
                      color: isCurrent
                        ? colors.textPrimary
                        : isCompleted
                        ? colors.accent
                        : colors.textMuted,
                      fontSize: typography.fontSizes.xs - 2,
                      fontWeight: isCurrent ? '700' : '500',
                    },
                  ]}
                >
                  {step.label}
                </Text>
              </View>

              {idx < STEPS.length - 1 ? (
                <View
                  style={[
                    styles.connectorLine,
                    {
                      backgroundColor: idx < currentIndex ? colors.accent : colors.border,
                    },
                  ]}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    width: 52,
  },
  circle: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  circleText: {
    fontWeight: '800',
  },
  stepLabel: {
    textAlign: 'center',
  },
  connectorLine: {
    flex: 1,
    height: 2,
    marginTop: -16,
    marginHorizontal: 2,
  },
});
