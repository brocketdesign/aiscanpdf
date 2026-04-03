import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

const fontConfig = {
  displayLarge: { fontFamily: 'System', fontWeight: '700' as const },
  displayMedium: { fontFamily: 'System', fontWeight: '700' as const },
  displaySmall: { fontFamily: 'System', fontWeight: '600' as const },
  headlineLarge: { fontFamily: 'System', fontWeight: '700' as const },
  headlineMedium: { fontFamily: 'System', fontWeight: '600' as const },
  headlineSmall: { fontFamily: 'System', fontWeight: '600' as const },
  titleLarge: { fontFamily: 'System', fontWeight: '600' as const },
  titleMedium: { fontFamily: 'System', fontWeight: '500' as const },
  titleSmall: { fontFamily: 'System', fontWeight: '500' as const },
  bodyLarge: { fontFamily: 'System', fontWeight: '400' as const },
  bodyMedium: { fontFamily: 'System', fontWeight: '400' as const },
  bodySmall: { fontFamily: 'System', fontWeight: '400' as const },
  labelLarge: { fontFamily: 'System', fontWeight: '500' as const },
  labelMedium: { fontFamily: 'System', fontWeight: '500' as const },
  labelSmall: { fontFamily: 'System', fontWeight: '500' as const },
};

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563EB',
    primaryContainer: '#DBEAFE',
    onPrimaryContainer: '#1E3A5F',
    secondary: '#7C3AED',
    secondaryContainer: '#EDE9FE',
    onSecondaryContainer: '#3B1D70',
    tertiary: '#0891B2',
    tertiaryContainer: '#CFFAFE',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F5F9',
    background: '#F8FAFC',
    error: '#DC2626',
    errorContainer: '#FEE2E2',
    outline: '#CBD5E1',
    outlineVariant: '#E2E8F0',
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#F8FAFC',
      level3: '#F1F5F9',
      level4: '#E2E8F0',
      level5: '#CBD5E1',
    },
  },
  roundness: 16,
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#60A5FA',
    primaryContainer: '#1E3A5F',
    onPrimaryContainer: '#DBEAFE',
    secondary: '#A78BFA',
    secondaryContainer: '#3B1D70',
    onSecondaryContainer: '#EDE9FE',
    tertiary: '#22D3EE',
    tertiaryContainer: '#164E63',
    surface: '#0F172A',
    surfaceVariant: '#1E293B',
    background: '#0A0E27',
    error: '#F87171',
    errorContainer: '#7F1D1D',
    outline: '#334155',
    outlineVariant: '#1E293B',
    elevation: {
      level0: 'transparent',
      level1: '#0F172A',
      level2: '#1E293B',
      level3: '#334155',
      level4: '#475569',
      level5: '#64748B',
    },
  },
  roundness: 16,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
