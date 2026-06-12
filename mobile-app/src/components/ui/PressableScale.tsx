import * as Haptics from "expo-haptics";
import type { ReactNode } from "react";
import { Pressable, type PressableProps, type ViewStyle } from "react-native";

type PressableScaleProps = PressableProps & {
  children: ReactNode;
  scale?: number;
  haptic?: boolean;
  style?: ViewStyle | ViewStyle[];
};

export function PressableScale({
  children,
  scale = 0.97,
  haptic = true,
  disabled,
  onPress,
  style,
  ...props
}: PressableScaleProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={(event) => {
        if (haptic && !disabled) {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.(event);
      }}
      style={({ pressed }) => [
        {
          transform: [{ scale: pressed && !disabled ? scale : 1 }],
          opacity: disabled ? 0.55 : 1,
          overflow: "visible",
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
}
