import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Droplets } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { usePremiumStore } from '@/store/premium-store';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  const handleRestore = async () => {
    await usePremiumStore.getState().restore();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 64 }]}>
      <View style={styles.hero}>
        <Droplets size={48} color={Colors.primary} />
        <Text style={styles.title}>AquaPulse</Text>
        <Text style={styles.subtitle}>Stay hydrated. Zero noise.</Text>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable
          onPress={() => router.push('/onboarding/goal')}
          style={styles.primaryButton}
          accessibilityLabel="Get started"
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </Pressable>

        <Pressable
          onPress={handleRestore}
          style={styles.restoreButton}
          accessibilityLabel="Restore previous purchases"
          accessibilityRole="button"
        >
          <Text style={styles.restoreText}>Already use AquaPulse? Restore</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  hero: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 32,
    marginTop: 16,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  restoreText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
});
