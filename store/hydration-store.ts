import { create } from 'zustand';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  addIntakeEntry,
  deleteIntakeEntry,
  updateIntakeEntryVolume,
  getTodayEntries,
  getDailySummary,
  getWeekSummaries,
  ensureDailySummary,
  getBeverageTypes,
  getReminderSlots,
  upsertReminderSlot,
  deleteReminderSlot,
  getTodayDate,
  getLast7Days,
} from '@/lib/database';
import { storage } from '@/lib/storage';
import {
  IntakeEntry,
  DailySummary,
  BeverageType,
  ReminderSlot,
  UserProfile,
  AppSettings,
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
  PRESET_BEVERAGES,
} from '@/types';

interface HydrationStore {
  // Profile & Settings
  profile: UserProfile;
  settings: AppSettings;

  // Today
  todayDate: string;
  todayEntries: IntakeEntry[];
  todaySummary: DailySummary | null;

  // Week
  weekSummaries: DailySummary[];

  // Beverages & Reminders
  beverageTypes: BeverageType[];
  selectedBeverageId: string;
  reminderSlots: ReminderSlot[];

  // Loading
  isReady: boolean;

  // Actions
  initialize: () => Promise<void>;
  refreshToday: () => Promise<void>;
  refreshWeek: () => Promise<void>;
  logDrink: (volumeMl: number) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  editEntryVolume: (id: string, newVolumeMl: number) => Promise<void>;
  selectBeverage: (id: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  setReminder: (slot: ReminderSlot) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
  updateStreak: () => Promise<void>;
}

export const useHydrationStore = create<HydrationStore>((set, get) => ({
  profile: DEFAULT_PROFILE,
  settings: DEFAULT_SETTINGS,
  todayDate: getTodayDate(),
  todayEntries: [],
  todaySummary: null,
  weekSummaries: [],
  beverageTypes: PRESET_BEVERAGES,
  selectedBeverageId: 'water',
  reminderSlots: [],
  isReady: false,

  initialize: async () => {
    const [profile, settings, lastBeverage] = await Promise.all([
      storage.getProfile(),
      storage.getSettings(),
      storage.getLastBeverage(),
    ]);

    const todayDate = getTodayDate();
    await ensureDailySummary(todayDate, profile.dailyGoalMl);

    const [todayEntries, todaySummary, beverageTypes, reminderSlots, weekSummaries] =
      await Promise.all([
        getTodayEntries(todayDate),
        getDailySummary(todayDate),
        getBeverageTypes(),
        getReminderSlots(),
        getWeekSummaries(getLast7Days()),
      ]);

    set({
      profile,
      settings,
      todayDate,
      todayEntries,
      todaySummary,
      beverageTypes,
      selectedBeverageId: lastBeverage,
      reminderSlots,
      weekSummaries,
      isReady: true,
    });
  },

  refreshToday: async () => {
    const todayDate = getTodayDate();
    const { profile } = get();
    await ensureDailySummary(todayDate, profile.dailyGoalMl);
    const [todayEntries, todaySummary] = await Promise.all([
      getTodayEntries(todayDate),
      getDailySummary(todayDate),
    ]);
    set({ todayDate, todayEntries, todaySummary });
  },

  refreshWeek: async () => {
    const weekSummaries = await getWeekSummaries(getLast7Days());
    set({ weekSummaries });
  },

  logDrink: async (volumeMl: number) => {
    const { selectedBeverageId, beverageTypes, profile, settings } = get();
    const beverage = beverageTypes.find((b) => b.id === selectedBeverageId) ?? beverageTypes[0];
    const effectiveMl = Math.round(volumeMl * beverage.hydrationMultiplier);
    const todayDate = getTodayDate();
    const loggedAt = new Date().toISOString();

    const entry = await addIntakeEntry({
      logDate: todayDate,
      loggedAt,
      beverageTypeId: beverage.id,
      beverageName: beverage.name,
      beverageIcon: beverage.icon,
      volumeMl,
      effectiveMl,
    });

    if (settings.hapticsEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Update today data
    const todayEntries = [entry, ...get().todayEntries];
    const todaySummary = await getDailySummary(todayDate);

    // Check if goal just reached
    const prevSummary = get().todaySummary;
    const justReachedGoal =
      todaySummary?.goalMet && !prevSummary?.goalMet;

    if (justReachedGoal && settings.hapticsEnabled && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    set({ todayEntries, todaySummary, todayDate });

    // Update streak if goal met
    if (justReachedGoal) {
      get().updateStreak();
    }

    // Refresh week data
    get().refreshWeek();
  },

  deleteEntry: async (id: string) => {
    const todayDate = getTodayDate();
    await deleteIntakeEntry(id, todayDate);

    const { settings } = get();
    if (settings.hapticsEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    await get().refreshToday();
    get().refreshWeek();
  },

  editEntryVolume: async (id: string, newVolumeMl: number) => {
    const todayDate = getTodayDate();
    const entry = get().todayEntries.find((e) => e.id === id);
    if (!entry) return;
    const beverage = get().beverageTypes.find((b) => b.id === entry.beverageTypeId);
    const multiplier = beverage?.hydrationMultiplier ?? 1.0;
    const newEffective = Math.round(newVolumeMl * multiplier);
    await updateIntakeEntryVolume(id, todayDate, newVolumeMl, newEffective);
    await get().refreshToday();
    get().refreshWeek();
  },

  selectBeverage: (id: string) => {
    set({ selectedBeverageId: id });
    storage.saveLastBeverage(id);
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    const current = get().profile;
    const updated = { ...current, ...updates };
    set({ profile: updated });
    await storage.saveProfile(updated);
    // If goal changed, update today summary
    if (updates.dailyGoalMl !== undefined) {
      const todayDate = getTodayDate();
      await ensureDailySummary(todayDate, updated.dailyGoalMl);
      await get().refreshToday();
    }
  },

  updateSettings: async (updates: Partial<AppSettings>) => {
    const current = get().settings;
    const updated = { ...current, ...updates };
    set({ settings: updated });
    await storage.saveSettings(updated);
  },

  setReminder: async (slot: ReminderSlot) => {
    await upsertReminderSlot(slot);
    const reminderSlots = await getReminderSlots();
    set({ reminderSlots });
  },

  removeReminder: async (id: string) => {
    await deleteReminderSlot(id);
    const reminderSlots = await getReminderSlots();
    set({ reminderSlots });
  },

  updateStreak: async () => {
    const { profile } = get();
    const today = getTodayDate();
    const lastUpdated = profile.streakLastUpdated;

    if (lastUpdated === today) return; // Already updated today

    let newStreak = profile.streakCurrent;

    if (lastUpdated) {
      const lastDate = new Date(lastUpdated);
      const todayDate = new Date(today);
      const diffDays = Math.round(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const newBest = Math.max(newStreak, profile.streakBest);
    await get().updateProfile({
      streakCurrent: newStreak,
      streakBest: newBest,
      streakLastUpdated: today,
    });
  },
}));
