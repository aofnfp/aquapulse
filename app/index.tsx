import { Redirect } from 'expo-router';
import { useHydrationStore } from '@/store/hydration-store';

export default function Index() {
  const onboardingCompleted = useHydrationStore((s) => s.profile.onboardingCompleted);

  if (!onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
