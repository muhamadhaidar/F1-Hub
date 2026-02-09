import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export function HapticTab(props: BottomTabBarButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <PlatformPressable
      {...props}
      onHoverIn={() => {
        scale.value = withSpring(1.15, { damping: 10, stiffness: 100 });
      }}
      onHoverOut={() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 100 });
      }}
      onPressIn={(ev: any) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        scale.value = withSpring(0.9, { damping: 10, stiffness: 100 });
        props.onPressIn?.(ev);
      }}
      onPressOut={(ev: any) => {
        scale.value = withSpring(1);
        props.onPressOut?.(ev);
      }}
    >
      <Animated.View style={[animatedStyle]}>
        {props.children}
      </Animated.View>
    </PlatformPressable>
  );
}
