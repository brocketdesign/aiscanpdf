import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';

const REVENUECAT_API_KEY_APPLE =
  process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY ?? '';
const REVENUECAT_API_KEY_GOOGLE =
  process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY ?? '';

/** The entitlement identifier you set in RevenueCat dashboard */
const ENTITLEMENT_ID = 'premium';

let isConfigured = false;

/**
 * Call once at app startup (e.g. in _layout.tsx).
 */
export async function configureRevenueCat(appUserId?: string): Promise<void> {
  if (isConfigured) return;

  const apiKey =
    Platform.OS === 'ios' ? REVENUECAT_API_KEY_APPLE : REVENUECAT_API_KEY_GOOGLE;

  if (!apiKey) {
    console.warn('RevenueCat API key not set for', Platform.OS);
    return;
  }

  Purchases.configure({ apiKey, appUserID: appUserId ?? undefined });

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  isConfigured = true;
}

/**
 * Log in a known user so purchases persist across devices.
 */
export async function loginUser(appUserId: string): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.logIn(appUserId);
  return customerInfo;
}

/**
 * Log out (anonymous mode).
 */
export async function logoutUser(): Promise<void> {
  await Purchases.logOut();
}

/**
 * Fetch available packages (monthly / yearly).
 */
export async function getOfferings(): Promise<PurchasesPackage[]> {
  const offerings = await Purchases.getOfferings();
  if (!offerings.current) return [];
  return offerings.current.availablePackages;
}

/**
 * Purchase a package. Returns updated CustomerInfo.
 */
export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

/**
 * Restore purchases (e.g. after reinstall or device switch).
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

/**
 * Get current customer info to check entitlements.
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

/**
 * Check if the user currently has an active premium entitlement.
 */
export function isPremiumActive(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

/**
 * Return expiration date (if any) for the premium entitlement.
 */
export function getPremiumExpiration(
  customerInfo: CustomerInfo
): string | undefined {
  return customerInfo.entitlements.active[ENTITLEMENT_ID]?.expirationDate ?? undefined;
}

/**
 * Return whether the subscription will renew or was cancelled.
 */
export function willRenew(customerInfo: CustomerInfo): boolean {
  const ent = customerInfo.entitlements.active[ENTITLEMENT_ID];
  return ent ? ent.willRenew : false;
}
