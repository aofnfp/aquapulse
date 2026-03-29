import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, AppSettings, DEFAULT_PROFILE, DEFAULT_SETTINGS } from '@/types';

const KEYS = {
  PROFILE: '@aquapulse/profile',
  SETTINGS: '@aquapulse/settings',
  LAST_BEVERAGE: '@aquapulse/last_beverage',
} as const;

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  // Profile
  getProfile: (): Promise<UserProfile> => getJSON(KEYS.PROFILE, DEFAULT_PROFILE),
  saveProfile: (profile: UserProfile): Promise<void> => setJSON(KEYS.PROFILE, profile),

  // Settings
  getSettings: (): Promise<AppSettings> => getJSON(KEYS.SETTINGS, DEFAULT_SETTINGS),
  saveSettings: (settings: AppSettings): Promise<void> => setJSON(KEYS.SETTINGS, settings),

  // Last used beverage
  getLastBeverage: async (): Promise<string> => {
    const val = await AsyncStorage.getItem(KEYS.LAST_BEVERAGE);
    return val ?? 'water';
  },
  saveLastBeverage: (id: string): Promise<void> =>
    AsyncStorage.setItem(KEYS.LAST_BEVERAGE, id),

  // Clear all
  clearAll: (): Promise<void> => AsyncStorage.multiRemove(Object.values(KEYS)),
};
