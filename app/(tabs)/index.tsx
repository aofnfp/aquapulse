import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback, useMemo } from 'react';
import {
  Droplets,
  Coffee,
  CupSoda,
  Citrus,
  Milk,
  Beer,
  FlaskRound,
  Wine,
  ChevronDown,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useHydrationStore } from '@/store/hydration-store';
import { usePremiumStore } from '@/store/premium-store';
import ProgressRing from '@/components/ProgressRing';
import AdBanner from '@/components/AdBanner';
import Paywall from '@/components/Paywall';
import BeveragePicker from '@/components/BeveragePicker';
import CustomAmountSheet from '@/components/CustomAmountSheet';
import { formatVolume, formatVolumeNumber, QUICK_ADD_AMOUNTS_ML, IntakeEntry } from '@/types';
import { getTimeGreeting } from '@/lib/database';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';

const ICON_MAP: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  droplets: Droplets,
  coffee: Coffee,
  'cup-soda': CupSoda,
  citrus: Citrus,
  milk: Milk,
  beer: Beer,
  'flask-round': FlaskRound,
  wine: Wine,
};

function getBeverageIcon(iconName: string) {
  return ICON_MAP[iconName] ?? Droplets;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    profile,
    todaySummary,
    todayEntries,
    beverageTypes,
    selectedBeverageId,
    logDrink,
    deleteEntry,
    weekSummaries,
  } = useHydrationStore();
  const isPremium = usePremiumStore((s) => s.isPremium);

  const [showPaywall, setShowPaywall] = useState(false);
  const [showBeveragePicker, setShowBeveragePicker] = useState(false);
  const [showCustomAmount, setShowCustomAmount] = useState(false);

  const selectedBeverage = beverageTypes.find((b) => b.id === selectedBeverageId) ?? beverageTypes[0];
  const BevIcon = getBeverageIcon(selectedBeverage.icon);

  const currentMl = todaySummary?.totalEffectiveMl ?? 0;
  const goalMl = profile.dailyGoalMl;
  const progress = goalMl > 0 ? currentMl / goalMl : 0;
  const goalReached = currentMl >= goalMl;
  const remainingMl = Math.max(0, goalMl - currentMl);

  const greeting = useMemo(() => getTimeGreeting(), []);
  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }, []);

  const handleQuickAdd = useCallback(
    (amountMl: number) => {
      logDrink(amountMl);
    },
    [logDrink]
  );

  const handleCustomAdd = useCallback(
    (amountMl: number) => {
      logDrink(amountMl);
      setShowCustomAmount(false);
    },
    [logDrink]
  );

  const handleDelete = useCallback(
    (entry: IntakeEntry) => {
      Alert.alert('Delete Entry', `Remove ${formatVolume(entry.volumeMl, profile.unit)} of ${entry.beverageName}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(entry.id) },
      ]);
    },
    [deleteEntry, profile.unit]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          {profile.streakCurrent > 0 && (
            <View
              style={styles.streakBadge}
              accessibilityLabel={`${profile.streakCurrent} day hydration streak`}
              accessibilityRole="text"
            >
              <Text style={styles.streakText}>{profile.streakCurrent}d</Text>
            </View>
          )}
        </View>

        {/* Progress Ring */}
        <View style={styles.ringSection}>
          <ProgressRing
            size={200}
            strokeWidth={14}
            progress={progress}
            goalReached={goalReached}
          >
            <Text style={[styles.ringNumber, goalReached && styles.ringNumberSuccess]}>
              {formatVolumeNumber(currentMl, profile.unit).toLocaleString()}
            </Text>
            <Text style={styles.ringGoal}>
              of {formatVolume(goalMl, profile.unit)}
            </Text>
          </ProgressRing>
          <Text style={[styles.remaining, goalReached && styles.remainingSuccess]}>
            {goalReached ? 'Goal reached' : `${formatVolume(remainingMl, profile.unit)} remaining`}
          </Text>
        </View>

        {/* Beverage Chip */}
        <Pressable
          onPress={() => setShowBeveragePicker(true)}
          style={styles.beverageChip}
          accessibilityLabel={`Selected beverage: ${selectedBeverage.name}. Double tap to change`}
          accessibilityRole="button"
        >
          <BevIcon size={16} color={Colors.primary} />
          <Text style={styles.beverageChipText}>{selectedBeverage.name}</Text>
          <ChevronDown size={14} color={Colors.textSecondary} />
        </Pressable>

        {/* Quick-Add Buttons */}
        <View style={styles.quickAddRow}>
          {QUICK_ADD_AMOUNTS_ML.map((ml) => (
            <Pressable
              key={ml}
              onPress={() => handleQuickAdd(ml)}
              style={({ pressed }) => [styles.quickAddButton, pressed && styles.quickAddPressed]}
              accessibilityLabel={`Log ${formatVolume(ml, profile.unit)} of ${selectedBeverage.name}`}
              accessibilityHint="Adds to your daily total"
              accessibilityRole="button"
            >
              <Text style={styles.quickAddText}>{formatVolume(ml, profile.unit)}</Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => setShowCustomAmount(true)}
            style={({ pressed }) => [styles.quickAddPlus, pressed && styles.quickAddPressed]}
            accessibilityLabel="Log custom amount"
            accessibilityRole="button"
          >
            <Plus size={22} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {/* Mini Week Chart */}
        <View style={styles.weekChart}>
          {weekSummaries.length > 0 ? (
            <View style={styles.weekBars}>
              {(() => {
                const maxMl = Math.max(...weekSummaries.map((s) => s.totalEffectiveMl), goalMl);
                const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                return weekSummaries.map((s, i) => {
                  const height = maxMl > 0 ? (s.totalEffectiveMl / maxMl) * 80 : 0;
                  const isToday = i === weekSummaries.length - 1;
                  return (
                    <View key={s.summaryDate} style={styles.barColumn}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(height, 2),
                            backgroundColor: s.goalMet
                              ? Colors.success
                              : isToday
                                ? '#7DD3FC'
                                : Colors.primary,
                          },
                        ]}
                      />
                      <Text style={styles.barLabel}>{days[i]}</Text>
                    </View>
                  );
                });
              })()}
            </View>
          ) : (
            <Text style={styles.emptyWeek}>Your weekly progress will appear here</Text>
          )}
        </View>

        {/* Today Section */}
        <Text style={styles.sectionTitle}>Today</Text>

        {todayEntries.length === 0 ? (
          <Text style={styles.emptyText}>Tap below to log your first drink</Text>
        ) : (
          <View style={styles.logList}>
            {todayEntries.map((entry) => {
              const EntryIcon = getBeverageIcon(entry.beverageIcon);
              return (
                <View key={entry.id} style={styles.logRow}>
                  <View style={styles.logLeft}>
                    <EntryIcon size={20} color={Colors.primary} />
                    <Text style={styles.logType}>{entry.beverageName}</Text>
                  </View>
                  <Text style={styles.logVolume}>
                    {formatVolume(entry.volumeMl, profile.unit)}
                  </Text>
                  <Text style={styles.logTime}>
                    {new Date(entry.loggedAt).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Pressable
                    onPress={() => handleDelete(entry)}
                    style={styles.deleteButton}
                    accessibilityLabel={`Delete ${entry.beverageName} entry`}
                    accessibilityRole="button"
                    hitSlop={8}
                  >
                    <Trash2 size={16} color={Colors.error} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <AdBanner />

      {/* Sheets */}
      <BeveragePicker visible={showBeveragePicker} onClose={() => setShowBeveragePicker(false)} />
      <CustomAmountSheet
        visible={showCustomAmount}
        onClose={() => setShowCustomAmount(false)}
        onAdd={handleCustomAdd}
        unit={profile.unit}
      />
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
    paddingBottom: 16,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  date: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  streakBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.primaryText,
    fontWeight: '500',
    letterSpacing: 0.33,
    textTransform: 'uppercase',
  },
  ringSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  ringNumber: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 40,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  ringNumberSuccess: {
    color: Colors.successText,
  },
  ringGoal: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  remaining: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 22,
    marginTop: 8,
  },
  remainingSuccess: {
    color: Colors.successText,
  },
  beverageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Colors.primaryFaint,
    marginTop: 24,
  },
  beverageChipText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  quickAddButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.ringTrack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddPressed: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  quickAddPlus: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.ringTrack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  weekChart: {
    marginTop: 32,
    height: 120,
    justifyContent: 'flex-end',
  },
  weekBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    gap: 12,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 2,
  },
  barLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
    letterSpacing: 0.33,
    textTransform: 'uppercase',
  },
  emptyWeek: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 24,
    marginTop: 32,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 12,
    lineHeight: 18,
  },
  logList: {
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceDivider,
    gap: 10,
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  logType: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  logVolume: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  logTime: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.33,
    textTransform: 'uppercase',
    lineHeight: 16,
    marginLeft: 8,
  },
  deleteButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
