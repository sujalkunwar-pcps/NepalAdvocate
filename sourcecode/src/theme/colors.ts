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
  inputBg: string;
}

export const LightColors: ColorScheme = {
  mode: 'light',
  background: '#F8FAFC',
  cardBackground: '#FFFFFF',
  cardBorder: '#E2E8F0',
  primary: '#0F172A',
  primaryDark: '#020617',
  accent: '#0F172A', // Minimalist Charcoal Accent (No blue)
  inputBottomBorder: '#E2E8F0',
  inputFocusedBorder: '#0F172A', // Crisp Dark Underline (No blue)
  inputErrorBorder: '#EF4444',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  roleBadgeClientBg: '#F1F5F9', // Neutral Slate
  roleBadgeClientText: '#0F172A',
  roleBadgeLawyerBg: '#FEF3C7',
  roleBadgeLawyerText: '#D97706',
  toggleBg: '#F1F5F9',
  inputBg: '#F1F5F9',
};

export const DarkColors: ColorScheme = {
  mode: 'dark',
  background: '#0B0F19',
  cardBackground: '#111827',
  cardBorder: '#1F2937',
  primary: '#F8FAFC',
  primaryDark: '#E2E8F0',
  accent: '#F8FAFC', // Minimalist White Accent (No blue)
  inputBottomBorder: '#374151',
  inputFocusedBorder: '#F8FAFC', // Crisp White Underline (No blue)
  inputErrorBorder: '#EF4444',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textInverse: '#0B0F19',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  roleBadgeClientBg: '#1F2937', // Dark Slate
  roleBadgeClientText: '#F9FAFB',
  roleBadgeLawyerBg: 'rgba(245, 158, 11, 0.15)',
  roleBadgeLawyerText: '#FBBF24',
  toggleBg: '#1F2937',
  inputBg: '#1F2937',
};
