import { Platform } from 'react-native';

export async function requestTrackingPermission(): Promise<boolean> {
  if (Platform.OS !== 'ios') return true;
  try {
    const { requestTrackingPermissionsAsync } = await import('expo-tracking-transparency');
    const { status } = await requestTrackingPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}
