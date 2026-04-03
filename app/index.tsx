import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useSubscriptionStore } from '../src/stores/subscriptionStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREMIUM_SHOWN_KEY = 'premium_shown_session';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { isPremium } = useSubscriptionStore();
  const [checkedPremium, setCheckedPremium] = useState(false);
  const [shouldShowPremium, setShouldShowPremium] = useState(false);

  useEffect(() => {
    (async () => {
      if (!isLoading && isAuthenticated && !isPremium()) {
        const shown = await AsyncStorage.getItem(PREMIUM_SHOWN_KEY);
        if (!shown) {
          await AsyncStorage.setItem(PREMIUM_SHOWN_KEY, 'true');
          setShouldShowPremium(true);
        }
      }
      setCheckedPremium(true);
    })();
  }, [isLoading, isAuthenticated]);

  if (isLoading || !checkedPremium) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (isAuthenticated) {
    if (shouldShowPremium) {
      return <Redirect href={"/premium" as any} />;
    }
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0E27',
  },
});
