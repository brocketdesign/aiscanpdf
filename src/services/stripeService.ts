import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import type { BillingPeriod } from '../types';

const STRIPE_SECRET_KEY = process.env.EXPO_SECRET_STRIPE ?? '';
const STRIPE_BASE_URL = 'https://api.stripe.com/v1';
const APP_SCHEME = 'aiscanpdf';

const PRICE_IDS = {
  monthly: 'price_monthly_premium', // Replace with your actual Stripe price ID
  yearly: 'price_yearly_premium',   // Replace with your actual Stripe price ID
};

async function stripeRequest(endpoint: string, body: Record<string, string>) {
  const response = await fetch(`${STRIPE_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body).toString(),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message ?? `Stripe error: ${response.status}`);
  }
  return response.json();
}

export async function createOrGetCustomer(email: string, name?: string): Promise<string> {
  // Search for existing customer
  const searchResponse = await fetch(
    `${STRIPE_BASE_URL}/customers/search?query=email:'${encodeURIComponent(email)}'`,
    {
      headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
    }
  );
  const searchData = await searchResponse.json();

  if (searchData.data?.length > 0) {
    return searchData.data[0].id;
  }

  // Create new customer
  const params: Record<string, string> = { email };
  if (name) params.name = name;

  const customer = await stripeRequest('/customers', params);
  return customer.id;
}

export async function createCheckoutSession(
  customerId: string,
  period: BillingPeriod
): Promise<string> {
  const successUrl = Linking.createURL('premium-success');
  const cancelUrl = Linking.createURL('premium-cancel');

  const session = await stripeRequest('/checkout/sessions', {
    customer: customerId,
    'line_items[0][price]': PRICE_IDS[period],
    'line_items[0][quantity]': '1',
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    'subscription_data[metadata][app]': 'aiscanpdf',
  });

  return session.url;
}

export async function openCheckout(
  email: string,
  name: string | undefined,
  period: BillingPeriod
): Promise<{ success: boolean }> {
  try {
    const customerId = await createOrGetCustomer(email, name);
    const checkoutUrl = await createCheckoutSession(customerId, period);

    const result = await WebBrowser.openAuthSessionAsync(
      checkoutUrl,
      `${APP_SCHEME}://`
    );

    if (result.type === 'success' && result.url?.includes('premium-success')) {
      return { success: true };
    }
    return { success: false };
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
}

export async function getSubscriptionStatus(customerId: string): Promise<{
  active: boolean;
  subscriptionId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}> {
  const response = await fetch(
    `${STRIPE_BASE_URL}/subscriptions?customer=${customerId}&status=active&limit=1`,
    {
      headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
    }
  );
  const data = await response.json();

  if (data.data?.length > 0) {
    const sub = data.data[0];
    return {
      active: true,
      subscriptionId: sub.id,
      currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
  }

  return { active: false };
}

export async function createBillingPortalSession(customerId: string): Promise<string> {
  const returnUrl = Linking.createURL('settings');

  const session = await stripeRequest('/billing_portal/sessions', {
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}

export async function openBillingPortal(customerId: string): Promise<void> {
  const portalUrl = await createBillingPortalSession(customerId);
  await WebBrowser.openBrowserAsync(portalUrl);
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await stripeRequest(`/subscriptions/${subscriptionId}`, {
    cancel_at_period_end: 'true',
  });
}
