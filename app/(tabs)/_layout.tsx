import { Tabs } from 'expo-router';
import { Home, BarChart3, Settings } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.surfaceDivider,
          borderTopWidth: 1,
          height: 56,
          paddingBottom: 4,
          shadowColor: Colors.textPrimary,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 4,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.33,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
          tabBarAccessibilityLabel: 'History tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          tabBarAccessibilityLabel: 'Settings tab',
        }}
      />
    </Tabs>
  );
}
