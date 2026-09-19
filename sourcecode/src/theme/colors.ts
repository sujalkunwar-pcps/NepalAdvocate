export type ThemeMode = 'light' | 'dark';

export interface ColorScheme {
  mode: ThemeMode;
  background: string;
  cardBackground: string;
  cardBorder: string;
  primary: string;
  primaryDark: string;
  accent: string;
  inputBottomBorder: string;
  inputFocusedBorder: string;
  inputErrorBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  success: string;
  error: string;
  warning: string;
  roleBadgeClientBg: string;
  roleBadgeClientText: string;
  roleBadgeLawyerBg: string;
  roleBadgeLawyerText: string;
  toggleBg: string;
}

export const LightColors: ColorScheme = {
  mode: 'light',
  background: '#F8FAFC',
  cardBackground: '#FFFFFF',
  cardBorder: '#E2E8F0',
  primary: '#0F172A',
  primaryDark: '#020617',
  accent: '#4F46E5', // Sleek Indigo accent
  inputBottomBorder: '#CBD5E1',
  inputFocusedBorder: '#4F46E5',
  inputErrorBorder: '#EF4444',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  roleBadgeClientBg: '#EEF2FF',
  roleBadgeClientText: '#4F46E5',
  roleBadgeLawyerBg: '#FEF3C7',
  roleBadgeLawyerText: '#D97706',
  toggleBg: '#F1F5F9',
};

export const DarkColors: ColorScheme = {
  mode: 'dark',
  background: '#0B0F19',
  cardBackground: '#111827',
  cardBorder: '#1F2937',
  primary: '#F8FAFC',
  primaryDark: '#E2E8F0',
  accent: '#6366F1', // Indigo Glow
  inputBottomBorder: '#374151',
  inputFocusedBorder: '#6366F1',
  inputErrorBorder: '#EF4444',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textInverse: '#0B0F19',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  roleBadgeClientBg: 'rgba(99, 102, 241, 0.15)',
  roleBadgeClientText: '#818CF8',
  roleBadgeLawyerBg: 'rgba(245, 158, 11, 0.15)',
  roleBadgeLawyerText: '#FBBF24',
  toggleBg: '#1F2937',
};
