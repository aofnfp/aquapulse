// ─── Beverage Types ───────────────────────────────────────────────
export interface BeverageType {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  hydrationMultiplier: number; // 0.5–1.0
  isPreset: boolean;
  displayOrder: number;
}

export const PRESET_BEVERAGES: BeverageType[] = [
  { id: 'water', name: 'Water', icon: 'droplets', hydrationMultiplier: 1.0, isPreset: true, displayOrder: 0 },
  { id: 'coffee', name: 'Coffee', icon: 'coffee', hydrationMultiplier: 0.8, isPreset: true, displayOrder: 1 },
  { id: 'tea', name: 'Tea', icon: 'cup-soda', hydrationMultiplier: 0.9, isPreset: true, displayOrder: 2 },
  { id: 'juice', name: 'Juice', icon: 'citrus', hydrationMultiplier: 0.85, isPreset: true, displayOrder: 3 },
  { id: 'milk', name: 'Milk', icon: 'milk', hydrationMultiplier: 0.9, isPreset: true, displayOrder: 4 },
  { id: 'soda', name: 'Soda', icon: 'beer', hydrationMultiplier: 0.75, isPreset: true, displayOrder: 5 },
  { id: 'sports', name: 'Sports Drink', icon: 'flask-round', hydrationMultiplier: 0.95, isPreset: true, displayOrder: 6 },
  { id: 'other', name: 'Other', icon: 'wine', hydrationMultiplier: 0.85, isPreset: true, displayOrder: 7 },
];

// ─── Intake Log ──────────────────────────────────────────────────
export interface IntakeEntry {
  id: string;
  logDate: string; // YYYY-MM-DD
  loggedAt: string; // ISO timestamp
  beverageTypeId: string;
  beverageName: string;
  beverageIcon: string;
  volumeMl: number;
  effectiveMl: number;
}

// ─── Daily Summary ───────────────────────────────────────────────
export interface DailySummary {
  summaryDate: string; // YYYY-MM-DD
  goalMl: number;
  totalVolumeMl: number;
  totalEffectiveMl: number;
  goalMet: boolean;
  entryCount: number;
}

// ─── Reminders ───────────────────────────────────────────────────
export interface ReminderSlot {
  id: string;
  timeHhmm: string; // "08:00"
  isEnabled: boolean;
  displayOrder: number;
}

// ─── User Profile / Settings ─────────────────────────────────────
export type UnitSystem = 'ml' | 'oz';

export interface UserProfile {
  dailyGoalMl: number;
  unit: UnitSystem;
  onboardingCompleted: boolean;
  streakCurrent: number;
  streakBest: number;
  streakLastUpdated: string | null;
}

export interface AppSettings {
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  endOfDaySummary: boolean;
  endOfDaySummaryTime: string; // "21:00"
}

export const DEFAULT_PROFILE: UserProfile = {
  dailyGoalMl: 2000,
  unit: 'ml',
  onboardingCompleted: false,
  streakCurrent: 0,
  streakBest: 0,
  streakLastUpdated: null,
};

export const DEFAULT_SETTINGS: AppSettings = {
  hapticsEnabled: true,
  notificationsEnabled: true,
  endOfDaySummary: true,
  endOfDaySummaryTime: '21:00',
};

// ─── Quick-Add Presets ───────────────────────────────────────────
export const QUICK_ADD_AMOUNTS_ML = [250, 500, 750];

// ─── Conversion ──────────────────────────────────────────────────
export const ML_PER_OZ = 29.5735;

export function mlToOz(ml: number): number {
  return Math.round(ml / ML_PER_OZ);
}

export function ozToMl(oz: number): number {
  return Math.round(oz * ML_PER_OZ);
}

export function formatVolume(ml: number, unit: UnitSystem): string {
  if (unit === 'oz') {
    return `${mlToOz(ml)} oz`;
  }
  return `${Math.round(ml)} ml`;
}

export function formatVolumeNumber(ml: number, unit: UnitSystem): number {
  if (unit === 'oz') return mlToOz(ml);
  return Math.round(ml);
}
