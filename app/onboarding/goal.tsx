import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Colors } from '@/constants/colors';
import { useHydrationStore } from '@/store/hydration-store';
import { UnitSystem, formatVolumeNumber, ozToMl, mlToOz } from '@/types';

const GOAL_PRESETS_ML = [1500, 2000, 2500, 3000];

export default function GoalScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useHydrationStore();
  const [selectedGoal, setSelectedGoal] = useState<number>(profile.dailyGoalMl);
  const [customValue, setCustomValue] = useState('');
  const [unit, setUnit] = useState<UnitSystem>(profile.unit);

  const displayGoal = (ml: number) => {
    if (unit === 'oz') return `${mlToOz(ml)} oz`;
    return ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml} ml`;
  };

  const handlePreset = (ml: number) => {
    setSelectedGoal(ml);
    setCustomValue('');
  };

  const handleCustomChange = (text: string) => {
    setCustomValue(text);
    const num = parseInt(text, 10);
    if (num > 0) {
      setSelectedGoal(unit === 'oz' ? ozToMl(num) : num);
    }
  };

  const handleContinue = async () => {
    const goal = selectedGoal > 0 ? selectedGoal : 2000;
    await updateProfile({ dailyGoalMl: goal, unit });
    router.push('/onboarding/reminders');
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
          onPress={handleContinue}
          style={styles.skipButton}
          accessibilityLabel="Skip goal setting"
          accessibilityRole="button"
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>How much water do you want to drink daily?</Text>
        <Text style={styles.subtitle}>Pick a target or enter your own.</Text>

        {/* Presets */}
        <View style={styles.presets}>
          {GOAL_PRESETS_ML.map((ml) => (
            <Pressable
              key={ml}
              onPress={() => handlePreset(ml)}
              style={[styles.preset, selectedGoal === ml && styles.presetSelected]}
              accessibilityLabel={`Set daily goal to ${displayGoal(ml)}`}
              accessibilityRole="button"
            >
              <Text
                style={[styles.presetText, selectedGoal === ml && styles.presetTextSelected]}
              >
                {displayGoal(ml)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Custom Input */}
        <View style={styles.customRow}>
          <TextInput
            value={customValue}
            onChangeText={handleCustomChange}
            placeholder={`Custom (${unit})`}
            placeholderTextColor={Colors.textMuted}
            keyboardType="number-pad"
            style={styles.customInput}
            accessibilityLabel={`Enter custom daily goal in ${unit === 'ml' ? 'milliliters' : 'ounces'}`}
          />
          <View style={styles.unitToggle}>
            {(['ml', 'oz'] as const).map((u) => (
              <Pressable
                key={u}
                onPress={() => setUnit(u)}
                style={[styles.unitButton, unit === u && styles.unitButtonActive]}
                accessibilityLabel={`Switch to ${u === 'ml' ? 'milliliters' : 'ounces'}`}
                accessibilityRole="button"
              >
                <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>
                  {u}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.disclaimer}>
          We don't track what you eat, your weight over time, or calories. Ever.
        </Text>
      </View>

      {/* Continue */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable
          onPress={handleContinue}
          style={styles.primaryButton}
          accessibilityLabel="Continue to reminders"
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
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
    color: Colors.primary,
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
  presets: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 32,
  },
  preset: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.surfaceDivider,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.ringTrack,
  },
  presetSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  presetText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  presetTextSelected: {
    color: Colors.primaryDark,
  },
  customRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  customInput: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ringTrack,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
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
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
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
  disclaimer: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 24,
    lineHeight: 16,
    letterSpacing: 0.33,
    textTransform: 'uppercase',
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
