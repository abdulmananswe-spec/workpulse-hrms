import * as Haptics from "expo-haptics";
import type { ReactNode } from "react";
import { Pressable, type PressableProps, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = PressableProps & {
  children: ReactNode;
  scale?: number;
  haptic?: boolean;
  style?: ViewStyle | ViewStyle[] | any;
};

export function PressableScale({
  children,
  scale = 0.96,
  haptic = true,
  disabled,
  onPress,
  style,
  ...props
}: PressableScaleProps) {
  const animatedScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: animatedScale.value }],
    };
  });

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={() => {
        if (!disabled) {
          animatedScale.value = withSpring(scale, { damping: 15, stiffness: 240 });
        }
      }}
      onPressOut={() => {
        animatedScale.value = withSpring(1, { damping: 15, stiffness: 240 });
      }}
      onPress={(event) => {
        if (haptic && !disabled) {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.(event);
      }}
      style={[
        {
          opacity: disabled ? 0.55 : 1,
          overflow: "visible",
        },
        animatedStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
