import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Subscription,
  UsageCredits,
  SubscriptionPlan,
  BillingPeriod,
} from '../types';
import { FREE_LIMITS, PREMIUM_LIMITS } from '../types';
import * as stripeService from '../services/stripeService';

const SUBSCRIPTION_KEY = 'user_subscription';
const USAGE_KEY = 'user_usage';

function getDefaultUsage(): UsageCredits {
  const now = new Date();
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return {
    scans_used: 0,
    scans_limit: FREE_LIMITS.scans_limit,
    ocr_used: 0,
    ocr_limit: FREE_LIMITS.ocr_limit,
    summaries_used: 0,
    summaries_limit: FREE_LIMITS.summaries_limit,
    tts_used: 0,
    tts_limit: FREE_LIMITS.tts_limit,
    qa_used: 0,
    qa_limit: FREE_LIMITS.qa_limit,
    reset_date: resetDate.toISOString(),
  };
}

function shouldResetUsage(resetDate: string): boolean {
  return new Date() >= new Date(resetDate);
}

interface SubscriptionState {
  subscription: Subscription;
  usage: UsageCredits;
  isLoading: boolean;
  showPremiumScreen: boolean;
  premiumTrigger: string;

  // Init
  loadSubscription: () => Promise<void>;

  // Subscription management
  isPremium: () => boolean;
  subscribe: (email: string, name: string | undefined, period: BillingPeriod) => Promise<boolean>;
  restoreSubscription: (email: string, name: string | undefined) => Promise<boolean>;
  manageSubscription: () => Promise<void>;
  cancelSubscription: () => Promise<void>;

  // Usage tracking
  canUseFeature: (feature: 'scans' | 'ocr' | 'summaries' | 'tts' | 'qa') => boolean;
  useCredit: (feature: 'scans' | 'ocr' | 'summaries' | 'tts' | 'qa') => Promise<boolean>;
  getRemainingCredits: (feature: 'scans' | 'ocr' | 'summaries' | 'tts' | 'qa') => number;

  // Premium screen
  setShowPremiumScreen: (show: boolean, trigger?: string) => void;
  dismissPremium: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: {
    plan: 'free',
    status: 'none',
  },
  usage: getDefaultUsage(),
  isLoading: false,
  showPremiumScreen: false,
  premiumTrigger: '',

  loadSubscription: async () => {
    try {
      const [subData, usageData] = await Promise.all([
        AsyncStorage.getItem(SUBSCRIPTION_KEY),
        AsyncStorage.getItem(USAGE_KEY),
      ]);

      let subscription: Subscription = { plan: 'free', status: 'none' };
      if (subData) {
        subscription = JSON.parse(subData);
      }

      let usage = getDefaultUsage();
      if (usageData) {
        usage = JSON.parse(usageData);
        // Reset usage if period has passed
        if (shouldResetUsage(usage.reset_date)) {
          usage = getDefaultUsage();
          await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(usage));
        }
      }

      // Apply correct limits based on plan
      const limits = subscription.plan === 'premium' ? PREMIUM_LIMITS : FREE_LIMITS;
      usage = { ...usage, ...limits };

      // Check if premium subscription is still active
      if (subscription.plan === 'premium' && subscription.stripe_customer_id) {
        try {
          const status = await stripeService.getSubscriptionStatus(
            subscription.stripe_customer_id
          );
          if (!status.active) {
            subscription = { ...subscription, plan: 'free', status: 'expired' };
            usage = { ...usage, ...FREE_LIMITS };
            await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
          } else {
            subscription = {
              ...subscription,
              status: 'active',
              stripe_subscription_id: status.subscriptionId,
              current_period_end: status.currentPeriodEnd,
              cancel_at_period_end: status.cancelAtPeriodEnd,
            };
            await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
          }
        } catch {
          // If we can't verify, keep current status
        }
      }

      set({ subscription, usage });
    } catch {
      set({ usage: getDefaultUsage() });
    }
  },

  isPremium: () => {
    const { subscription } = get();
    return subscription.plan === 'premium' && subscription.status === 'active';
  },

  subscribe: async (email, name, period) => {
    set({ isLoading: true });
    try {
      const result = await stripeService.openCheckout(email, name, period);
      if (result.success) {
        const customerId = await stripeService.createOrGetCustomer(email, name);
        const status = await stripeService.getSubscriptionStatus(customerId);

        const subscription: Subscription = {
          plan: 'premium',
          status: 'active',
          stripe_customer_id: customerId,
          stripe_subscription_id: status.subscriptionId,
          billing_period: period,
          current_period_end: status.currentPeriodEnd,
          cancel_at_period_end: false,
        };

        const usage = {
          ...get().usage,
          ...PREMIUM_LIMITS,
        };

        await Promise.all([
          AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription)),
          AsyncStorage.setItem(USAGE_KEY, JSON.stringify(usage)),
        ]);

        set({ subscription, usage, showPremiumScreen: false });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Subscribe error:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  restoreSubscription: async (email, name) => {
    set({ isLoading: true });
    try {
      const customerId = await stripeService.createOrGetCustomer(email, name);
      const status = await stripeService.getSubscriptionStatus(customerId);

      if (status.active) {
        const subscription: Subscription = {
          plan: 'premium',
          status: 'active',
          stripe_customer_id: customerId,
          stripe_subscription_id: status.subscriptionId,
          current_period_end: status.currentPeriodEnd,
          cancel_at_period_end: status.cancelAtPeriodEnd,
        };

        const usage = { ...get().usage, ...PREMIUM_LIMITS };

        await Promise.all([
          AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription)),
          AsyncStorage.setItem(USAGE_KEY, JSON.stringify(usage)),
        ]);

        set({ subscription, usage });
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  manageSubscription: async () => {
    const { subscription } = get();
    if (subscription.stripe_customer_id) {
      await stripeService.openBillingPortal(subscription.stripe_customer_id);
    }
  },

  cancelSubscription: async () => {
    const { subscription } = get();
    if (subscription.stripe_subscription_id) {
      await stripeService.cancelSubscription(subscription.stripe_subscription_id);
      const updated = {
        ...subscription,
        cancel_at_period_end: true,
      };
      await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(updated));
      set({ subscription: updated });
    }
  },

  canUseFeature: (feature) => {
    const { usage } = get();
    if (get().isPremium()) return true;

    switch (feature) {
      case 'scans':
        return usage.scans_used < usage.scans_limit;
      case 'ocr':
        return usage.ocr_used < usage.ocr_limit;
      case 'summaries':
        return usage.summaries_used < usage.summaries_limit;
      case 'tts':
        return usage.tts_used < usage.tts_limit;
      case 'qa':
        return usage.qa_used < usage.qa_limit;
      default:
        return false;
    }
  },

  useCredit: async (feature) => {
    const state = get();
    if (state.isPremium()) return true;

    if (!state.canUseFeature(feature)) {
      set({
        showPremiumScreen: true,
        premiumTrigger: feature,
      });
      return false;
    }

    const usage = { ...state.usage };
    switch (feature) {
      case 'scans':
        usage.scans_used++;
        break;
      case 'ocr':
        usage.ocr_used++;
        break;
      case 'summaries':
        usage.summaries_used++;
        break;
      case 'tts':
        usage.tts_used++;
        break;
      case 'qa':
        usage.qa_used++;
        break;
    }

    await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(usage));
    set({ usage });
    return true;
  },

  getRemainingCredits: (feature) => {
    const { usage } = get();
    if (get().isPremium()) return 999999;

    switch (feature) {
      case 'scans':
        return Math.max(0, usage.scans_limit - usage.scans_used);
      case 'ocr':
        return Math.max(0, usage.ocr_limit - usage.ocr_used);
      case 'summaries':
        return Math.max(0, usage.summaries_limit - usage.summaries_used);
      case 'tts':
        return Math.max(0, usage.tts_limit - usage.tts_used);
      case 'qa':
        return Math.max(0, usage.qa_limit - usage.qa_used);
      default:
        return 0;
    }
  },

  setShowPremiumScreen: (show, trigger = '') => set({ showPremiumScreen: show, premiumTrigger: trigger }),
  dismissPremium: () => set({ showPremiumScreen: false, premiumTrigger: '' }),
}));
