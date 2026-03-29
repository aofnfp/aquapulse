import { View, Text, Pressable, ScrollView, Switch, Alert, StyleSheet, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { ChevronRight, Lock } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useHydrationStore } from '@/store/hydration-store';
import { usePremiumStore } from '@/store/premium-store';
import Paywall from '@/components/Paywall';
import { formatVolume, UnitSystem } from '@/types';
import { deleteAllData, exportDataAsJson } from '@/lib/database';
import { storage } from '@/lib/storage';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, settings, updateProfile, updateSettings, reminderSlots } = useHydrationStore();
  const isPremium = usePremiumStore((s) => s.isPremium);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleGoalEdit = () => {
    Alert.prompt(
      'Daily Goal',
      `Enter your daily goal in ${profile.unit}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (value) => {
            const num = parseInt(value ?? '', 10);
            if (num > 0) {
              const ml = profile.unit === 'oz' ? Math.round(num * 29.5735) : num;
              updateProfile({ dailyGoalMl: ml });
            }
          },
        },
      ],
      'plain-text',
      String(
        profile.unit === 'oz'
          ? Math.round(profile.dailyGoalMl / 29.5735)
          : profile.dailyGoalMl
      )
    );
  };

  const handleUnitChange = (unit: UnitSystem) => {
    updateProfile({ unit });
  };

  const handleExport = async () => {
    const json = await exportDataAsJson();
    await Share.share({ message: json, title: 'AquaPulse Data Export' });
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your hydration logs, daily summaries, and reminders. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            await deleteAllData();
            await storage.clearAll();
            // Reset to onboarding
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        {/* Daily Goal */}
        <Text style={styles.sectionLabel}>DAILY GOAL</Text>
        <View style={styles.card}>
          <Pressable
            onPress={handleGoalEdit}
            style={styles.row}
            accessibilityLabel={`Daily target: ${formatVolume(profile.dailyGoalMl, profile.unit)}. Tap to edit`}
            accessibilityRole="button"
          >
            <Text style={styles.rowLabel}>Daily target</Text>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>
                {formatVolume(profile.dailyGoalMl, profile.unit)}
              </Text>
              <ChevronRight size={16} color={Colors.textMuted} />
            </View>
          </Pressable>
          <View style={styles.separator} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Units</Text>
            <View style={styles.unitToggle}>
              {(['ml', 'oz'] as const).map((u) => (
                <Pressable
                  key={u}
                  onPress={() => handleUnitChange(u)}
                  style={[styles.unitButton, profile.unit === u && styles.unitButtonActive]}
                  accessibilityLabel={`Switch to ${u === 'ml' ? 'milliliters' : 'ounces'}`}
                  accessibilityRole="button"
                >
                  <Text style={[styles.unitText, profile.unit === u && styles.unitTextActive]}>
                    {u}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Reminders */}
        <Text style={styles.sectionLabel}>REMINDERS</Text>
        <View style={styles.card}>
          {reminderSlots.map((slot, i) => (
            <View key={slot.id}>
              {i > 0 && <View style={styles.separator} />}
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{slot.timeHhmm}</Text>
                <Switch
                  value={slot.isEnabled}
                  onValueChange={(val) =>
                    useHydrationStore.getState().setReminder({ ...slot, isEnabled: val })
                  }
                  trackColor={{ false: Colors.ringTrack, true: Colors.primaryLight }}
                  thumbColor={slot.isEnabled ? Colors.primary : Colors.textMuted}
                  accessibilityLabel={`Reminder at ${slot.timeHhmm}`}
                  accessibilityRole="switch"
                />
              </View>
            </View>
          ))}
          {reminderSlots.length === 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>No reminders set</Text>
            </View>
          )}
        </View>

        {/* Premium */}
        <Text style={styles.sectionLabel}>PREMIUM</Text>
        <View style={styles.card}>
          {!isPremium && (
            <Pressable
              onPress={() => setShowPaywall(true)}
              style={styles.row}
              accessibilityLabel="Upgrade to Premium"
              accessibilityRole="button"
            >
              <Text style={[styles.rowLabel, { color: Colors.primary }]}>
                Upgrade to Premium
              </Text>
              <ChevronRight size={16} color={Colors.primary} />
            </Pressable>
          )}
          {isPremium && (
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: Colors.success }]}>
                Premium Active
              </Text>
            </View>
          )}
          <View style={styles.separator} />
          <Pressable
            onPress={() => usePremiumStore.getState().restore()}
            style={styles.row}
            accessibilityLabel="Restore purchases"
            accessibilityRole="button"
          >
            <Text style={styles.rowLabel}>Restore purchases</Text>
          </Pressable>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>End-of-day summary</Text>
            <Switch
              value={settings.endOfDaySummary}
              onValueChange={(val) => updateSettings({ endOfDaySummary: val })}
              trackColor={{ false: Colors.ringTrack, true: Colors.primaryLight }}
              thumbColor={settings.endOfDaySummary ? Colors.primary : Colors.textMuted}
              accessibilityLabel="End-of-day summary notification"
              accessibilityRole="switch"
            />
          </View>
        </View>

        {/* Data */}
        <Text style={styles.sectionLabel}>DATA</Text>
        <View style={styles.card}>
          <Pressable
            onPress={handleExport}
            style={styles.row}
            accessibilityLabel="Export data as JSON"
            accessibilityRole="button"
          >
            <Text style={styles.rowLabel}>Export data (JSON)</Text>
            <ChevronRight size={16} color={Colors.textMuted} />
          </Pressable>
          <View style={styles.separator} />
          <Pressable
            onPress={handleDeleteAll}
            style={styles.row}
            accessibilityLabel="Delete all data"
            accessibilityRole="button"
          >
            <Text style={[styles.rowLabel, { color: Colors.error }]}>Delete all data</Text>
          </Pressable>
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.card}>
          <Pressable
            onPress={() => router.push('/privacy')}
            style={styles.row}
            accessibilityLabel="Privacy Policy"
            accessibilityRole="button"
          >
            <Text style={styles.rowLabel}>Privacy Policy</Text>
            <ChevronRight size={16} color={Colors.textMuted} />
          </Pressable>
          <View style={styles.separator} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>

      <Paywall visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 32,
  },
  sectionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    letterSpacing: 0.33,
    textTransform: 'uppercase',
    lineHeight: 16,
    marginTop: 24,
    marginBottom: 8,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceDivider,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  rowLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.surfaceDivider,
    marginLeft: 16,
  },
  unitToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.ringTrack,
  },
  unitButton: {
    paddingHorizontal: 14,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    minWidth: 44,
  },
  unitButtonActive: {
    backgroundColor: Colors.primary,
  },
  unitText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  unitTextActive: {
    color: '#FFFFFF',
  },
});
