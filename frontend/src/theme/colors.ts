export const darkColors = {
  // Brand & Accents
  primary: '#00E5FF',       // Electric Cyan / Teal
  primaryDark: '#00B4D8',
  primaryLight: '#E0F7FA',
  secondary: '#6366F1',     // AI SaaS Indigo
  accent: '#10B981',        // Emerald Green

  // Backgrounds & Surfaces
  background: '#0A0E1A',   // Midnight Dark Obsidian
  surface: '#131B2E',      // Card Surface
  surfaceVariant: '#1E293B',// Elevated Surface
  border: '#2A364F',       // Soft Border

  // Text Colors
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',

  // Status & Feedback
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Overlays & Highlights
  glassOverlay: 'rgba(19, 27, 46, 0.75)',
  cyanGlow: 'rgba(0, 229, 255, 0.15)',
};

export const lightColors = {
  // Brand & Accents
  primary: '#0F172A',       // Midnight Dark Blue
  primaryDark: '#020617',
  primaryLight: '#1E293B',
  secondary: '#4F46E5',     // AI SaaS Indigo
  accent: '#00B4D8',        // Electric Blue Accent

  // Backgrounds & Surfaces
  background: '#F8FAFC',   // Crisp Slate background
  surface: '#FFFFFF',      // Pure White Card Surface
  surfaceVariant: '#F1F5F9',// Light Gray Surface
  border: '#E2E8F0',       // Light Border

  // Text Colors
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Status & Feedback
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Overlays & Highlights
  glassOverlay: 'rgba(255, 255, 255, 0.85)',
  cyanGlow: 'rgba(0, 180, 216, 0.1)',
};

export type ThemeColors = typeof darkColors;
