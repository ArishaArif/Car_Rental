import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';

type SplashScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

interface SplashScreenProps {
  navigation: SplashScreenNavigationProp;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-advance
    const timer = setTimeout(() => {
      if (!isAuthenticated || !user) {
        navigation.replace('Onboarding');
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigation, isAuthenticated, user, fadeAnim, scaleAnim]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Decorative ambient background glows */}
      <View
        style={[
          styles.ambientGlow,
          {
            backgroundColor: colors.primary,
            opacity: 0.12,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Brand Icon Badge */}
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: borderRadius.xl,
            },
          ]}
        >
          <Text style={styles.brandEmoji}>⚡</Text>
        </View>

        {/* Brand Name */}
        <Text
          style={[
            styles.brandTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.display,
              fontWeight: typography.fontWeights.heavy,
            },
          ]}
        >
          VELOX<Text style={{ color: colors.primary }}>.</Text>
        </Text>

        {/* Tagline */}
        <Text
          style={[
            styles.tagline,
            {
              color: colors.textSecondary,
              fontSize: typography.fontSizes.sm,
              letterSpacing: typography.letterSpacing.wide,
              marginTop: spacing.xs,
            },
          ]}
        >
          NEXT-GEN LUXURY & FLEET MOBILITY
        </Text>

        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.pulseDot,
              {
                backgroundColor: colors.primary,
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              {
                color: colors.textMuted,
                fontSize: typography.fontSizes.xs,
                marginLeft: spacing.xs + 2,
              },
            ]}
          >
            Initializing Secure Session...
          </Text>
        </View>
      </Animated.View>

      {/* Footer System Version */}
      <View style={[styles.footer, { paddingBottom: spacing.lg }]}>
        <Text style={[styles.versionText, { color: colors.textMuted }]}>
          v1.0.0 Enterprise Build
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  brandEmoji: {
    fontSize: 44,
  },
  brandTitle: {
    letterSpacing: 2,
  },
  tagline: {
    textTransform: 'uppercase',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 36,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 16,
  },
  versionText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
