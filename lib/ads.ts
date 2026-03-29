import { Platform } from 'react-native';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const INTERSTITIAL_ID = Platform.select({
  ios: process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL || TestIds.INTERSTITIAL,
  android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL || TestIds.INTERSTITIAL,
  default: TestIds.INTERSTITIAL,
});

export const BANNER_ID = Platform.select({
  ios: process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER || TestIds.ADAPTIVE_BANNER,
  android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER || TestIds.ADAPTIVE_BANNER,
  default: TestIds.ADAPTIVE_BANNER,
});

let interstitial: InterstitialAd | null = null;
let isInterstitialLoaded = false;

export function preloadInterstitial(): void {
  if (Platform.OS === 'web' || !INTERSTITIAL_ID) return;

  interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID, {
    requestNonPersonalizedAdsOnly: true,
  });

  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    isInterstitialLoaded = true;
  });

  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    isInterstitialLoaded = false;
    preloadInterstitial();
  });

  interstitial.addAdEventListener(AdEventType.ERROR, () => {
    isInterstitialLoaded = false;
  });

  interstitial.load();
}

export async function showInterstitial(): Promise<boolean> {
  if (!isInterstitialLoaded || !interstitial) return false;
  try {
    await interstitial.show();
    isInterstitialLoaded = false;
    return true;
  } catch {
    return false;
  }
}

export function isInterstitialReady(): boolean {
  return isInterstitialLoaded;
}
