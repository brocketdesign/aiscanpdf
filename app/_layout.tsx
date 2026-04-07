import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../src/stores/authStore';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useSubscriptionStore } from '../src/stores/subscriptionStore';
import { configureRevenueCat } from '../src/services/iapService';
import { lightTheme, darkTheme } from '../src/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { initialize } = useAuthStore();
  const { theme: themePreference, loadSettings, isLoaded } = useSettingsStore();
  const { loadSubscription } = useSubscriptionStore();

  useEffect(() => {
    configureRevenueCat().then(() => {
      loadSubscription();
    });
    initialize();
    loadSettings();
  }, []);

  const isDark =
    themePreference === 'dark' || (themePreference === 'system' && colorScheme === 'dark');
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: theme.colors.background },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login" options={{ animation: 'fade' }} />
            <Stack.Screen name="register" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen
              name="preview"
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
            <Stack.Screen name="document/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen
              name="premium"
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
            <Stack.Screen name="privacy-policy" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="terms-of-service" options={{ animation: 'slide_from_right' }} />
          </Stack>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
