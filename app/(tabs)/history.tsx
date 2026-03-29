import { View, Text, Pressable, ScrollView, StyleSheet, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useMemo } from 'react';
import { Check, Lock } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useHydrationStore } from '@/store/hydration-store';
import { usePremiumStore } from '@/store/premium-store';
import AdBanner from '@/components/AdBanner';
import Paywall from '@/components/Paywall';
import { formatVolume, DailySummary } from '@/types';
import { getEntriesForDate, getMonthSummaries } from '@/lib/database';
import type { IntakeEntry } from '@/types';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { profile, weekSummaries, refreshWeek } = useHydrationStore();
  const isPremium = usePremiumStore((s) => s.isPremium);

  const [view, setView] = useState<'week' | 'month'>('week');
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayEntries, setDayEntries] = useState<IntakeEntry[]>([]);
  const [monthData, setMonthData] = useState<DailySummary[]>([]);

  const goalMl = profile.dailyGoalMl;
  const maxMl = useMemo(
    () => Math.max(...weekSummaries.map((s) => s.totalEffectiveMl), goalMl, 1),
    [weekSummaries, goalMl]
  );

  const weekAvg = useMemo(() => {
    if (weekSummaries.length === 0) return 0;
    const total = weekSummaries.reduce((sum, s) => sum + s.totalEffectiveMl, 0);
    return Math.round(total / weekSummaries.length);
  }, [weekSummaries]);

  const bestDay = useMemo(() => {
    if (weekSummaries.length === 0) return '';
    const best = weekSummaries.reduce((a, b) => (a.totalEffectiveMl > b.totalEffectiveMl ? a : b));
    const d = new Date(best.summaryDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }, [weekSummaries]);

  useEffect(() => {
    refreshWeek();
  }, [refreshWeek]);

  useEffect(() => {
    if (view === 'month' && isPremium) {
      const now = new Date();
      getMonthSummaries(now.getFullYear(), now.getMonth() + 1).then(setMonthData);
    }
  }, [view, isPremium]);

  const handleDayPress = async (date: string) => {
    setSelectedDay(date);
    const entries = await getEntriesForDate(date);
    setDayEntries(entries);
  };

  const handleMonthPress = () => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }
    setView('month');
  };

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>History</Text>

        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <Pressable
            onPress={() => setView('week')}
            style={[styles.togglePill, view === 'week' && styles.togglePillActive]}
            accessibilityLabel="Week view"
            accessibilityRole="button"
          >
            <Text style={[styles.toggleText, view === 'week' && styles.toggleTextActive]}>
              Week
            </Text>
          </Pressable>
          <Pressable
            onPress={handleMonthPress}
            style={[styles.togglePill, view === 'month' && isPremium && styles.togglePillActive]}
            accessibilityLabel="Month view"
            accessibilityRole="button"
          >
            <Text style={[styles.toggleText, view === 'month' && isPremium && styles.toggleTextActive]}>
              Month
            </Text>
            {!isPremium && <Lock size={12} color={Colors.textMuted} />}
          </Pressable>
        </View>

        {/* Week Chart */}
        {view === 'week' && (
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {weekSummaries.map((s, i) => {
                const height = maxMl > 0 ? (s.totalEffectiveMl / maxMl) * 120 : 0;
                const isToday = i === weekSummaries.length - 1;
                return (
                  <Pressable
                    key={s.summaryDate}
                    onPress={() => handleDayPress(s.summaryDate)}
                    style={styles.chartBarColumn}
                    accessibilityLabel={`${days[i]}: ${formatVolume(s.totalEffectiveMl, profile.unit)}`}
                    accessibilityRole="button"
                  >
                    <View
                      style={[
                        styles.chartBar,
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
                    <Text style={styles.chartBarLabel}>{days[i]}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Goal Line */}
            <View style={styles.stats}>
              <Text style={styles.statText}>Avg: {formatVolume(weekAvg, profile.unit)}</Text>
              <Text style={styles.statText}>Best: {bestDay}</Text>
            </View>
          </View>
        )}

        {/* Month Heat Map (Premium) */}
        {view === 'month' && isPremium && (
          <View style={styles.chartCard}>
            <Text style={styles.monthTitle}>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <View style={styles.heatMapGrid}>
              {monthData.map((d) => (
                <Pressable
                  key={d.summaryDate}
                  onPress={() => handleDayPress(d.summaryDate)}
                  style={[
                    styles.heatCell,
                    {
                      backgroundColor: d.goalMet
                        ? Colors.success
                        : d.totalEffectiveMl >= d.goalMl * 0.75
                          ? Colors.warning
                          : Colors.surfaceDivider,
                    },
                  ]}
                  accessibilityLabel={`${d.summaryDate}: ${formatVolume(d.totalEffectiveMl, profile.unit)}`}
                  accessibilityRole="button"
                >
                  <Text style={styles.heatCellText}>
                    {parseInt(d.summaryDate.split('-')[2], 10)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Day List */}
        <Text style={styles.sectionTitle}>
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <View style={styles.dayList}>
          {weekSummaries
            .slice()
            .reverse()
            .map((s) => {
              const d = new Date(s.summaryDate + 'T00:00:00');
              return (
                <Pressable
                  key={s.summaryDate}
                  onPress={() => handleDayPress(s.summaryDate)}
                  style={styles.dayRow}
                  accessibilityLabel={`${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}: ${formatVolume(s.totalEffectiveMl, profile.unit)} of ${formatVolume(s.goalMl, profile.unit)}`}
                  accessibilityRole="button"
                >
                  <View>
                    <Text style={styles.dayDate}>
                      {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>
                    <View style={styles.dayDots}>
                      {Array.from({ length: Math.min(s.entryCount, 8) }).map((_, i) => (
                        <View key={i} style={styles.dot} />
                      ))}
                    </View>
                  </View>
                  <View style={styles.dayRight}>
                    <Text style={styles.dayVolume}>
                      {formatVolume(s.totalEffectiveMl, profile.unit)} / {formatVolume(s.goalMl, profile.unit)}
                    </Text>
                    {s.goalMet && <Check size={16} color={Colors.success} />}
                  </View>
                </Pressable>
              );
            })}
        </View>
      </ScrollView>

      <AdBanner />

      {/* Day Detail Sheet */}
      <Modal visible={!!selectedDay} animationType="slide" transparent>
        <Pressable style={styles.backdrop} onPress={() => setSelectedDay(null)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {selectedDay
                ? new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })
                : ''}
            </Text>
            {dayEntries.length === 0 ? (
              <Text style={styles.emptyText}>No entries for this day</Text>
            ) : (
              <ScrollView>
                {dayEntries.map((entry) => (
                  <View key={entry.id} style={styles.entryRow}>
                    <Text style={styles.entryType}>{entry.beverageName}</Text>
                    <Text style={styles.entryVolume}>
                      {formatVolume(entry.volumeMl, profile.unit)}
                    </Text>
                    <Text style={styles.entryTime}>
                      {new Date(entry.loggedAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </Pressable>
      </Modal>

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
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 32,
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  togglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: Colors.surfaceDivider,
  },
  togglePillActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    gap: 12,
  },
  chartBarColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 44,
    minHeight: 44,
  },
  chartBar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 2,
  },
  chartBarLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 6,
    letterSpacing: 0.33,
    textTransform: 'uppercase',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  monthTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  heatMapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  heatCell: {
    width: 40,
    height: 40,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatCellText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 24,
    marginTop: 24,
  },
  dayList: {
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceDivider,
    minHeight: 44,
  },
  dayDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  dayDots: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  dayRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayVolume: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(12, 25, 41, 0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.ringTrack,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  sheetTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceDivider,
  },
  entryType: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  entryVolume: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  entryTime: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.33,
    textTransform: 'uppercase',
  },
});
