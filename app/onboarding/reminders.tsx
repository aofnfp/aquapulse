import { View, Text, Pressable, Switch, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Sunrise, Sun, Sunset } from 'lucide-react-native';
import { useState } from 'react';
import { Colors } from '@/constants/colors';
import { useHydrationStore } from '@/store/hydration-store';
import { requestNotificationPermission, scheduleReminders } from '@/lib/notifications';

const DEFAULT_REMINDERS = [
  { id: 'morning', label: 'Morning', time: '08:00', icon: Sunrise },
  { id: 'midday', label: 'Midday', time: '12:00', icon: Sun },
  { id: 'afternoon', label: 'Afternoon', time: '16:00', icon: Sunset },
];

export default function RemindersScreen() {
  const insets = useSafeAreaInsets();
  const { updateProfile, setReminder, profile } = useHydrationStore();
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    morning: true,
    midday: true,
    afternoon: true,
  });

  const handleFinish = async () => {
    // Set up reminders if any are enabled
    const hasEnabled = Object.values(enabled).some(Boolean);
    if (hasEnabled) {
      await requestNotificationPermission();
      for (const r of DEFAULT_REMINDERS) {
        if (enabled[r.id]) {
          await setReminder({
            id: r.id,
            timeHhmm: r.time,
            isEnabled: true,
            displayOrder: DEFAULT_REMINDERS.indexOf(r),
          });
        }
      }
    }

    // Mark onboarding complete
    await updateProfile({ onboardingCompleted: true });
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ArrowLeft size={24} color={Colors.textSecondary} />
        </Pressable>
        <Pressable
          onPress={handleFinish}
          style={styles.skipButton}
          accessibilityLabel="Skip reminders"
          accessibilityRole="button"
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>When should we remind you?</Text>
        <Text style={styles.subtitle}>Set up to 3 daily reminders.</Text>

        <View style={styles.reminders}>
          {DEFAULT_REMINDERS.map((r) => {
            const Icon = r.icon;
            return (
              <View key={r.id} style={styles.reminderCard}>
                <View style={styles.reminderLeft}>
                  <Icon size={24} color={Colors.primary} />
                  <View>
                    <Text style={styles.reminderLabel}>{r.label}</Text>
                    <Text style={styles.reminderTime}>{r.time}</Text>
                  </View>
                </View>
                <Switch
                  value={enabled[r.id]}
                  onValueChange={(val) => setEnabled({ ...enabled, [r.id]: val })}
                  trackColor={{ false: Colors.ringTrack, true: Colors.primaryLight }}
                  thumbColor={enabled[r.id] ? Colors.primary : Colors.textMuted}
                  accessibilityLabel={`${r.label} reminder at ${r.time}`}
                  accessibilityRole="switch"
                />
              </View>
            );
          })}
        </View>
      </View>

      {/* Finish */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable
          onPress={handleFinish}
          style={styles.primaryButton}
          accessibilityLabel="Finish setup and start using AquaPulse"
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>Let's Go</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 52,
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.primaryText,
    lineHeight: 18,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 32,
    flex: 1,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 22,
  },
  reminders: {
    marginTop: 32,
    gap: 12,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceDivider,
    paddingHorizontal: 16,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  reminderTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bottom: {
    paddingHorizontal: 20,
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
});
