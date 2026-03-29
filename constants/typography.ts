import { TextStyle } from 'react-native';

export const Typography: Record<string, TextStyle> = {
  display: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  displaySub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  h1: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.24,
  },
  h2: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  h3: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: 0.13,
  },
  caption: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.33,
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.15,
  },
  tabLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.33,
  },
  quickAdd: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
} as const;
