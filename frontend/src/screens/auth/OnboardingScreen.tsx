import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
        <View style={[styles.topBar, { paddingHorizontal: spacing.md, paddingTop: spacing.xs, paddingBottom: spacing.xs }]}>
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

          {!isLastSlide ? (
            <TouchableOpacity
              onPress={handleSkip}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[
                styles.skipButton,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                  borderRadius: borderRadius.full,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
            >
              <Text
                style={[
                  styles.skipText,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.fontSizes.xs + 1,
                    fontWeight: typography.fontWeights.semiBold,
                  },
                ]}
              >
                Skip
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 48 }} />
          )}
        </View>
      }
      footer={
        <View
          style={[
            styles.bottomContainer,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.md,
              paddingBottom: spacing.sm,
            },
          ]}
        >
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
                variant="secondary"
                size="large"
                onPress={() => setCurrentIndex(prev => prev - 1)}
                style={{ marginRight: spacing.sm, minWidth: 90 }}
              />
            ) : null}

            <Button
              title={isLastSlide ? 'Get Started' : 'Continue'}
              variant="primary"
              size="large"
              onPress={handleNext}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      }
    >
      <ScrollView
        contentContainerStyle={[styles.scrollSlideContent, { paddingHorizontal: spacing.lg }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Visual Showcase Card */}
        <Card
          variant="elevated"
          padding="medium"
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
      </ScrollView>
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
    minHeight: 44,
  },
  brandMini: {
    letterSpacing: 1.5,
  },
  skipButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    letterSpacing: 0.3,
  },
  scrollSlideContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  heroCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 180,
    maxHeight: 250,
    marginBottom: 16,
  },
  badgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    marginBottom: 10,
  },
  badgeText: {
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  glyphContainer: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphText: {
    fontSize: 54,
  },
  statChip: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
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
    marginBottom: 16,
    gap: 8,
  },
  pageIndicator: {
    height: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
});
