import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import RevenueCatUI from 'react-native-purchases-ui';
import { GradientButton } from '../src/components/GradientButton';
import { useSubscriptionStore } from '../src/stores/subscriptionStore';
import * as iapService from '../src/services/iapService';

export default function PremiumScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isPremium, dismissPremium, loadSubscription } = useSubscriptionStore();

  const handleClose = () => {
    dismissPremium();
    router.back();
  };

  const handlePurchaseCompleted = async () => {
    // Sync local subscription state after RevenueCat paywall purchase
    await loadSubscription();
    handleClose();
  };

  const handleRestoreCompleted = async () => {
    await loadSubscription();
    handleClose();
  };

  if (isPremium()) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.onSurface} />
          </Pressable>
        </View>
        <View style={styles.premiumActiveContainer}>
          <LinearGradient
            colors={['#F59E0B', '#EF4444']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.crownCircle}
          >
            <Ionicons name="diamond" size={48} color="#FFF" />
          </LinearGradient>
          <Text variant="headlineMedium" style={{ fontWeight: '700', marginTop: 20 }}>
            You're Premium!
          </Text>
          <Text
            variant="bodyLarge"
            style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}
          >
            Enjoy unlimited access to all features
          </Text>
          <View style={{ marginTop: 32, width: '100%', paddingHorizontal: 32 }}>
            <GradientButton title="Done" onPress={handleClose} size="lg" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RevenueCatUI.Paywall
        onPurchaseCompleted={handlePurchaseCompleted}
        onRestoreCompleted={handleRestoreCompleted}
        onDismiss={handleClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 4,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumActiveContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  crownCircle: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
