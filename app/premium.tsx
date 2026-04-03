import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Dimensions,
  Alert,
} from 'react-native';
import { Text, useTheme, ActivityIndicator, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { GradientButton } from '../src/components/GradientButton';
import { useSubscriptionStore } from '../src/stores/subscriptionStore';
import { useAuthStore } from '../src/stores/authStore';
import type { BillingPeriod } from '../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FEATURES = [
  {
    icon: 'scan-outline',
    title: 'Unlimited Scans',
    subtitle: 'Scan as many pages as you need',
    freeLimit: '5/month',
  },
  {
    icon: 'text-outline',
    title: 'Unlimited OCR',
    subtitle: 'Extract text from any document',
    freeLimit: '3/month',
  },
  {
    icon: 'flash-outline',
    title: 'AI Summaries',
    subtitle: 'Smart document analysis & summaries',
    freeLimit: '2/month',
  },
  {
    icon: 'volume-high-outline',
    title: 'Text-to-Speech',
    subtitle: 'Listen to your documents read aloud',
    freeLimit: '1/month',
  },
  {
    icon: 'chatbubble-ellipses-outline',
    title: 'Document Q&A',
    subtitle: 'Ask questions about your documents',
    freeLimit: '2/month',
  },
  {
    icon: 'eye-off-outline',
    title: 'No Advertisements',
    subtitle: 'Enjoy a clean, ad-free experience',
    freeLimit: 'Ads shown',
  },
];

const MONTHLY_PRICE = 4.99;
const YEARLY_PRICE = 49.99;
const YEARLY_MONTHLY_EQUIVALENT = (YEARLY_PRICE / 12).toFixed(2);
const YEARLY_SAVINGS = Math.round((1 - YEARLY_PRICE / (MONTHLY_PRICE * 12)) * 100);

export default function PremiumScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    subscribe,
    restoreSubscription,
    isPremium,
    isLoading,
    premiumTrigger,
    dismissPremium,
    usage,
  } = useSubscriptionStore();

  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>('yearly');
  const [snackbar, setSnackbar] = useState('');

  const handleSubscribe = async () => {
    if (!user?.email) {
      setSnackbar('Please sign in first');
      return;
    }
    try {
      const success = await subscribe(user.email, user.full_name, selectedPeriod);
      if (success) {
        setSnackbar('Welcome to Premium!');
        setTimeout(() => router.back(), 1500);
      }
    } catch (e: any) {
      setSnackbar(e.message ?? 'Subscription failed');
    }
  };

  const handleRestore = async () => {
    if (!user?.email) {
      setSnackbar('Please sign in first');
      return;
    }
    const restored = await restoreSubscription(user.email, user.full_name);
    if (restored) {
      setSnackbar('Subscription restored!');
      setTimeout(() => router.back(), 1500);
    } else {
      setSnackbar('No active subscription found');
    }
  };

  const handleClose = () => {
    dismissPremium();
    router.back();
  };

  const triggerLabels: Record<string, string> = {
    scans: 'You\'ve used all your free page scans',
    ocr: 'You\'ve used all your free OCR extractions',
    summaries: 'You\'ve used all your free AI summaries',
    tts: 'You\'ve used all your free text-to-speech credits',
    qa: 'You\'ve used all your free Q&A credits',
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Close button */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#7C3AED', '#EC4899', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <Ionicons name="diamond" size={56} color="#FFF" />
          </LinearGradient>
          <Text variant="headlineMedium" style={[styles.heroTitle, { color: theme.colors.onSurface }]}>
            Unlock Premium
          </Text>
          <Text
            variant="bodyLarge"
            style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 6 }}
          >
            Scan, analyze, and manage documents{'\n'}without limits
          </Text>
        </View>

        {/* Trigger Message */}
        {premiumTrigger && triggerLabels[premiumTrigger] ? (
          <View style={[styles.triggerBanner, { backgroundColor: theme.colors.errorContainer }]}>
            <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.error, marginLeft: 8, flex: 1, fontWeight: '500' }}
            >
              {triggerLabels[premiumTrigger]}
            </Text>
          </View>
        ) : null}

        {/* Current Usage (Free Users) */}
        <View style={styles.usageSection}>
          <Text
            variant="labelLarge"
            style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            YOUR FREE USAGE THIS MONTH
          </Text>
          <View style={[styles.usageCard, { backgroundColor: theme.colors.surface }]}>
            <UsageBar
              label="Page Scans"
              used={usage.scans_used}
              limit={usage.scans_limit}
              color="#2563EB"
              theme={theme}
            />
            <UsageBar
              label="OCR Extractions"
              used={usage.ocr_used}
              limit={usage.ocr_limit}
              color="#7C3AED"
              theme={theme}
            />
            <UsageBar
              label="AI Summaries"
              used={usage.summaries_used}
              limit={usage.summaries_limit}
              color="#EC4899"
              theme={theme}
            />
            <UsageBar
              label="Text-to-Speech"
              used={usage.tts_used}
              limit={usage.tts_limit}
              color="#0891B2"
              theme={theme}
            />
            <UsageBar
              label="Document Q&A"
              used={usage.qa_used}
              limit={usage.qa_limit}
              color="#F59E0B"
              theme={theme}
            />
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text
            variant="labelLarge"
            style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            EVERYTHING IN PREMIUM
          </Text>
          {FEATURES.map((feature) => (
            <View
              key={feature.title}
              style={[styles.featureRow, { backgroundColor: theme.colors.surface }]}
            >
              <View style={[styles.featureIcon, { backgroundColor: '#7C3AED15' }]}>
                <Ionicons name={feature.icon as any} size={22} color="#7C3AED" />
              </View>
              <View style={styles.featureContent}>
                <Text variant="bodyLarge" style={{ fontWeight: '600' }}>
                  {feature.title}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant, marginTop: 1 }}
                >
                  {feature.subtitle}
                </Text>
              </View>
              <View style={styles.freeLimitBadge}>
                <Text style={styles.freeLimitText}>Free: {feature.freeLimit}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.pricingSection}>
          <Text
            variant="labelLarge"
            style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            CHOOSE YOUR PLAN
          </Text>

          {/* Yearly */}
          <Pressable
            onPress={() => setSelectedPeriod('yearly')}
            style={[
              styles.priceCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor:
                  selectedPeriod === 'yearly' ? '#7C3AED' : theme.colors.outlineVariant,
                borderWidth: selectedPeriod === 'yearly' ? 2 : 1,
              },
            ]}
          >
            {selectedPeriod === 'yearly' && (
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
            )}
            <View style={styles.priceCardContent}>
              <View style={styles.priceRadio}>
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor:
                        selectedPeriod === 'yearly' ? '#7C3AED' : theme.colors.outline,
                    },
                  ]}
                >
                  {selectedPeriod === 'yearly' && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium" style={{ fontWeight: '700' }}>
                  Yearly
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
                >
                  ${YEARLY_MONTHLY_EQUIVALENT}/month · Save {YEARLY_SAVINGS}%
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text variant="titleLarge" style={{ fontWeight: '700', color: '#7C3AED' }}>
                  ${YEARLY_PRICE}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  per year
                </Text>
              </View>
            </View>
          </Pressable>

          {/* Monthly */}
          <Pressable
            onPress={() => setSelectedPeriod('monthly')}
            style={[
              styles.priceCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor:
                  selectedPeriod === 'monthly' ? '#7C3AED' : theme.colors.outlineVariant,
                borderWidth: selectedPeriod === 'monthly' ? 2 : 1,
              },
            ]}
          >
            <View style={styles.priceCardContent}>
              <View style={styles.priceRadio}>
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor:
                        selectedPeriod === 'monthly' ? '#7C3AED' : theme.colors.outline,
                    },
                  ]}
                >
                  {selectedPeriod === 'monthly' && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium" style={{ fontWeight: '700' }}>
                  Monthly
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
                >
                  Flexible, cancel anytime
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text variant="titleLarge" style={{ fontWeight: '700' }}>
                  ${MONTHLY_PRICE}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  per month
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Subscribe Button */}
        <View style={styles.subscribeSection}>
          <GradientButton
            title={
              isLoading
                ? 'Processing...'
                : `Subscribe · $${selectedPeriod === 'yearly' ? YEARLY_PRICE + '/yr' : MONTHLY_PRICE + '/mo'}`
            }
            onPress={handleSubscribe}
            loading={isLoading}
            variant="secondary"
            size="lg"
          />

          <Pressable onPress={handleRestore} style={styles.restoreButton}>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.primary, fontWeight: '500' }}
            >
              Restore Purchase
            </Text>
          </Pressable>

          <Text
            variant="bodySmall"
            style={[styles.legalText, { color: theme.colors.onSurfaceVariant }]}
          >
            Cancel anytime. Subscription renews automatically.{'\n'}
            By subscribing, you agree to our Terms of Service.
          </Text>
        </View>
      </ScrollView>

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={3000}>
        {snackbar}
      </Snackbar>
    </View>
  );
}

function UsageBar({
  label,
  used,
  limit,
  color,
  theme,
}: {
  label: string;
  used: number;
  limit: number;
  color: string;
  theme: any;
}) {
  const percentage = Math.min((used / limit) * 100, 100);
  const isExhausted = used >= limit;

  return (
    <View style={styles.usageBarContainer}>
      <View style={styles.usageBarHeader}>
        <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
          {label}
        </Text>
        <Text
          variant="bodySmall"
          style={{
            color: isExhausted ? theme.colors.error : theme.colors.onSurfaceVariant,
            fontWeight: isExhausted ? '600' : '400',
          }}
        >
          {used}/{limit}
        </Text>
      </View>
      <View style={[styles.usageBarTrack, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View
          style={[
            styles.usageBarFill,
            {
              width: `${percentage}%`,
              backgroundColor: isExhausted ? theme.colors.error : color,
            },
          ]}
        />
      </View>
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
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 0,
    paddingBottom: 24,
  },
  heroGradient: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  triggerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
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
  usageSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  usageCard: {
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  usageBarContainer: {
    gap: 6,
  },
  usageBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usageBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  usageBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  featuresSection: {
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  freeLimitBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freeLimitText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400E',
  },
  pricingSection: {
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 10,
  },
  priceCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  priceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  bestValueBadge: {
    backgroundColor: '#7C3AED',
    paddingVertical: 4,
    alignItems: 'center',
  },
  bestValueText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  priceRadio: {
    marginRight: 14,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7C3AED',
  },
  subscribeSection: {
    paddingHorizontal: 16,
    marginTop: 28,
    alignItems: 'center',
  },
  restoreButton: {
    marginTop: 16,
    padding: 8,
  },
  legalText: {
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
    fontSize: 11,
  },
});
