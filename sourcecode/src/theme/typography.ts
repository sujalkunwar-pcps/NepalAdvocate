import { Platform } from 'react-native';

const baseFont = Platform.select({
  ios: '-apple-system',
  android: 'sans-serif',
  web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  default: 'System',
}) || 'System';

export const typography = {
  // Primary Commercial Font Family (Clean, crisp, ultra-legible sans-serif)
  fontFamily: baseFont,

  // Direct font aliases for convenience across components
  regular: baseFont,
  medium: baseFont,
  semiBold: baseFont,
  bold: baseFont,

  // Font Weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },

  // Letter Spacing presets for commercial UI readability
  letterSpacing: {
    tight: -0.6,
    snug: -0.3,
    normal: 0,
    wide: 0.4,
    uppercase: 0.6,
  },
};
