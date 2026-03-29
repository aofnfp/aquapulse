import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ReminderSlot } from '@/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleReminders(
  slots: ReminderSlot[],
  currentMl: number,
  goalMl: number
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const enabledSlots = slots.filter((s) => s.isEnabled);
  for (const slot of enabledSlots) {
    const [hours, minutes] = slot.timeHhmm.split(':').map(Number);
    const percent = goalMl > 0 ? Math.round((currentMl / goalMl) * 100) : 0;

    const bodies = [
      `${currentMl}ml of ${goalMl}ml — time for a glass.`,
      `You're at ${percent}% today. Keep it flowing.`,
      `Quick break? Perfect time for water.`,
    ];
    const body = bodies[Math.floor(Math.random() * bodies.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'AquaPulse',
        body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });
  }
}

export async function scheduleEndOfDaySummary(
  time: string,
  totalMl: number,
  goalMl: number,
  streak: number
): Promise<void> {
  const [hours, minutes] = time.split(':').map(Number);
  const goalMet = totalMl >= goalMl;

  const title = goalMet ? 'Daily goal reached' : "Today's wrap-up";
  const body = goalMet
    ? `You hit ${totalMl}ml today. ${streak}d and counting.`
    : `${totalMl}ml today — every bit counts.`;

  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
