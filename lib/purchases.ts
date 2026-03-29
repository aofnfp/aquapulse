import { Platform } from 'react-native';
import Purchases, { PurchasesOffering, CustomerInfo } from 'react-native-purchases';

const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

export const ENTITLEMENT_ID = 'premium';
export const MONTHLY_PRODUCT_ID = 'aquapulse_premium_monthly';
export const ANNUAL_PRODUCT_ID = 'aquapulse_premium_annual';

let isConfigured = false;

export async function initPurchases(): Promise<void> {
  if (isConfigured || Platform.OS === 'web') return;
  try {
    const apiKey = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
    if (!apiKey) return;
    await Purchases.configure({ apiKey });
    isConfigured = true;
  } catch {
    // RevenueCat not available
  }
}

export async function checkPremiumStatus(): Promise<boolean> {
  if (!isConfigured) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!isConfigured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch {
    return null;
  }
}

export async function purchaseMonthly(): Promise<boolean> {
  if (!isConfigured) return false;
  try {
    const offerings = await Purchases.getOfferings();
    const monthly = offerings.current?.monthly;
    if (!monthly) return false;
    const { customerInfo } = await Purchases.purchasePackage(monthly);
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

export async function purchaseAnnual(): Promise<boolean> {
  if (!isConfigured) return false;
  try {
    const offerings = await Purchases.getOfferings();
    const annual = offerings.current?.annual;
    if (!annual) return false;
    const { customerInfo } = await Purchases.purchasePackage(annual);
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!isConfigured) return false;
  try {
    const info = await Purchases.restorePurchases();
    return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

export function addPurchaseListener(callback: (info: CustomerInfo) => void): void {
  if (!isConfigured) return;
  Purchases.addCustomerInfoUpdateListener(callback);
}
