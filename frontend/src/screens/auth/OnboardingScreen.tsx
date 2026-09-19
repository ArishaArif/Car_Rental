import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { ScreenContainer, Button, Card } from '../../components/common';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Onboarding'
>;

interface OnboardingScreenProps {
  navigation: OnboardingScreenNavigationProp;
}

interface SlideItem {
  id: string;
  icon: string;
  badge: string;
  title: string;
  description: string;
  stats: { label: string; value: string };
}

const ONBOARDING_SLIDES: SlideItem[] = [
  {
    id: 'slide-1',
    icon: '🏎️',
    badge: 'LUXURY SELECTION',
    title: 'Curated Fleet of High-End Mobility',
    description:
      'Experience the thrill of driving pristine electric supercars, luxury sedans, and performance SUVs tailored for your lifestyle.',
    stats: { label: 'Active Fleet', value: '450+ Vehicles' },
  },
  {
    id: 'slide-2',
    icon: '🔑',
    badge: 'INSTANT DIGITAL UNLOCK',
    title: 'Keyless Freedom & On-Demand Delivery',
    description:
      'Reserve in 60 seconds. Unlock directly with your smartphone and have vehicles delivered straight to your door or airport terminal.',
    stats: { label: 'Average Booking Time', value: '< 2 Mins' },
  },
  {
    id: 'slide-3',
    icon: '📈',
    badge: 'FLEET & ENTERPRISE',
    title: 'Scale & Monetize Your Own Fleet',
    description:
      'Full-spectrum telematics, automated guest verification, dynamic pricing, and comprehensive revenue analytics for fleet operators.',
    stats: { label: 'Fleet Utilization Rate', value: '88.4%' },
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentSlide = ONBOARDING_SLIDES[currentIndex];
  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      navigation.navigate('RoleSelection');
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    navigation.navigate('RoleSelection');
  };

  return (
    <ScreenContainer
      style={styles.container}
      header={
        <View style={[styles.topBar, { paddingHorizontal: spacing.md, paddingTop: spacing.sm }]}>
          <Text
            style={[
              styles.brandMini,
              {
                color: colors.primary,
                fontSize: typography.fontSizes.sm,
                fontWeight: typography.fontWeights.bold,
              },
            ]}
          >
            VELOX MOBILITY
          </Text>

          <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text
              style={[
                styles.skipText,
                {
                  color: colors.textSecondary,
                  fontSize: typography.fontSizes.sm,
                  fontWeight: typography.fontWeights.semiBold,
                },
              ]}
            >
              Skip
            </Text>
          </TouchableOpacity>
        </View>
      }
      footer={
        <View style={[styles.bottomContainer, { padding: spacing.lg, borderTopColor: colors.border }]}>
          {/* Pagination Indicators */}
          <View style={styles.paginationRow}>
            {ONBOARDING_SLIDES.map((slide, index) => {
              const isActive = index === currentIndex;
              return (
                <View
                  key={slide.id}
                  style={[
                    styles.pageIndicator,
                    {
                      backgroundColor: isActive ? colors.primary : colors.surfaceVariant,
                      width: isActive ? 28 : 8,
                      borderRadius: borderRadius.full,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {currentIndex > 0 ? (
              <Button
                title="Back"
                variant="ghost"
                size="medium"
                onPress={() => setCurrentIndex(prev => prev - 1)}
                style={{ marginRight: spacing.sm, minWidth: 80 }}
              />
            ) : null}

            <Button
              title={isLastSlide ? 'Get Started' : 'Continue'}
              variant="primary"
              size="large"
              onPress={handleNext}
              fullWidth={currentIndex === 0}
              style={currentIndex > 0 ? { flex: 1 } : undefined}
            />
          </View>
        </View>
      }
    >
      <View style={[styles.slideContent, { paddingHorizontal: spacing.lg }]}>
        {/* Visual Showcase Card */}
        <Card
          variant="elevated"
          padding="large"
          style={[styles.heroCard, { borderColor: colors.border }]}
        >
          {/* Accent Badge */}
          <View
            style={[
              styles.badgeContainer,
              {
                backgroundColor: 'rgba(0, 229, 255, 0.1)',
                borderColor: colors.primary,
                borderRadius: borderRadius.sm,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.primary, fontSize: typography.fontSizes.xs }]}>
              {currentSlide.badge}
            </Text>
          </View>

          {/* Big Glyph / Graphic */}
          <View style={styles.glyphContainer}>
            <Text style={styles.glyphText}>{currentSlide.icon}</Text>
          </View>

          {/* Stat Chip */}
          <View
            style={[
              styles.statChip,
              {
                backgroundColor: colors.surfaceVariant,
                borderRadius: borderRadius.md,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {currentSlide.stats.label}
            </Text>
            <Text
              style={[
                styles.statValue,
                { color: colors.textPrimary, fontWeight: typography.fontWeights.bold },
              ]}
            >
              {currentSlide.stats.value}
            </Text>
          </View>
        </Card>

        {/* Text Block */}
        <View style={styles.textBlock}>
          <Text
            style={[
              styles.title,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSizes.xxl,
                fontWeight: typography.fontWeights.heavy,
                marginBottom: spacing.sm,
              },
            ]}
          >
            {currentSlide.title}
          </Text>

          <Text
            style={[
              styles.description,
              {
                color: colors.textSecondary,
                fontSize: typography.fontSizes.md,
                lineHeight: 24,
              },
            ]}
          >
            {currentSlide.description}
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandMini: {
    letterSpacing: 1.5,
  },
  skipText: {
    padding: 4,
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  heroCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 260,
    marginBottom: 28,
  },
  badgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    marginBottom: 16,
  },
  badgeText: {
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  glyphContainer: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphText: {
    fontSize: 68,
  },
  statChip: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 13,
  },
  textBlock: {
    marginTop: 4,
  },
  title: {
    letterSpacing: -0.3,
  },
  description: {
    letterSpacing: 0.1,
  },
  bottomContainer: {
    borderTopWidth: 1,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  pageIndicator: {
    height: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
