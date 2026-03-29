import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { requestTrackingPermission } from '@/lib/tracking';
import { initPurchases } from '@/lib/purchases';
import { preloadInterstitial } from '@/lib/ads';
import { requestNotificationPermission } from '@/lib/notifications';
import { usePremiumStore } from '@/store/premium-store';
import { useHydrationStore } from '@/store/hydration-store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const isReady = useHydrationStore((s) => s.isReady);

  useEffect(() => {
    async function init() {
      // Load fonts
      await Font.loadAsync({
        Inter_400Regular: require('@expo-google-fonts/inter/Inter_400Regular.ttf'),
        Inter_500Medium: require('@expo-google-fonts/inter/Inter_500Medium.ttf'),
        Inter_600SemiBold: require('@expo-google-fonts/inter/Inter_600SemiBold.ttf'),
        PlusJakartaSans_600SemiBold: require('@expo-google-fonts/plus-jakarta-sans/PlusJakartaSans_600SemiBold.ttf'),
        PlusJakartaSans_700Bold: require('@expo-google-fonts/plus-jakarta-sans/PlusJakartaSans_700Bold.ttf'),
      });
      setFontsLoaded(true);

      // Request permissions
      await requestTrackingPermission();
      await requestNotificationPermission();

      // Init purchases
      await initPurchases();
      await usePremiumStore.getState().loadStatus();
      usePremiumStore.getState().startListening();

      // Preload ads (only for non-premium)
      if (!usePremiumStore.getState().isPremium) {
        preloadInterstitial();
      }

      // Initialize hydration data
      await useHydrationStore.getState().initialize();
    }

    init();
  }, []);

  useEffect(() => {
    if (fontsLoaded && isReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isReady]);

  if (!fontsLoaded || !isReady) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="privacy" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
