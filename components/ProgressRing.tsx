import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Colors } from '@/constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0-1
  goalReached: boolean;
  children?: React.ReactNode;
}

export default function ProgressRing({
  size,
  strokeWidth,
  progress,
  goalReached,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.min(progress, 1), {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const gradientId = goalReached ? 'successGradient' : 'primaryGradient';

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityLabel={`${Math.round(progress * 100)}% of daily goal`}
      accessibilityRole="text"
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="primaryGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#0EA5E9" />
            <Stop offset="1" stopColor="#06B6D4" />
          </LinearGradient>
          <LinearGradient id="successGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#10B981" />
            <Stop offset="1" stopColor="#34D399" />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={Colors.ringTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Fill */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={[styles.inner, { width: size, height: size }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
