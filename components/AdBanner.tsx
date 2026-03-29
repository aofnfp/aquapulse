import { View, Platform, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { BANNER_ID } from '@/lib/ads';
import { usePremiumStore } from '@/store/premium-store';
import { Colors } from '@/constants/colors';

interface AdBannerProps {
  style?: object;
}

export default function AdBanner({ style }: AdBannerProps) {
  const isPremium = usePremiumStore((s) => s.isPremium);

  if (isPremium || Platform.OS === 'web' || !BANNER_ID) return null;

  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel="Advertisement"
      accessibilityRole="none"
    >
      <BannerAd
        unitId={BANNER_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceDivider,
  },
});
