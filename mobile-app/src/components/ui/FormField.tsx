import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { PressableScale } from "@/components/ui/PressableScale";
import { useDesignTokens } from "@/hooks/useDesignTokens";

type FormFieldProps = TextInputProps & {
  label: string;
};

export function FormField({ label, secureTextEntry, ...props }: FormFieldProps) {
  const tokens = useDesignTokens();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const focusAnim = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    focusAnim.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnim.value = withTiming(0, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: withTiming(isFocused ? tokens.primary : tokens.border, { duration: 150 }),
      backgroundColor: withTiming(isFocused ? tokens.backgroundElevated : tokens.backgroundMuted, { duration: 150 }),
    };
  });

  const shouldHideText = secureTextEntry && !showPassword;

  return (
    <View className="mb-4">
      <Text className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: tokens.textSecondary }}>
        {label}
      </Text>
      <Animated.View
        className="flex-row items-center rounded-2xl border px-4"
        style={[{ minHeight: 52 }, animatedStyle]}
      >
        <TextInput
          placeholderTextColor={tokens.textMuted}
          className="flex-1 py-3 text-base"
          style={{
            color: tokens.text,
          }}
          secureTextEntry={shouldHideText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {secureTextEntry ? (
          <PressableScale
            onPress={() => setShowPassword(!showPassword)}
            className="p-1"
            scale={0.9}
            haptic
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={tokens.textSecondary}
            />
          </PressableScale>
        ) : null}
      </Animated.View>
    </View>
  );
}

type ChipSelectProps<T extends string> = {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
};

export function ChipSelect<T extends string>({ label, options, value, onChange }: ChipSelectProps<T>) {
  const tokens = useDesignTokens();

  return (
    <View className="mb-4">
      <Text className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: tokens.textSecondary }}>
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <PressableScale
              key={option.value}
              onPress={() => onChange(option.value)}
              className="rounded-full px-4 py-2.5 border"
              style={{
                backgroundColor: selected ? tokens.primary : tokens.backgroundMuted,
                borderColor: selected ? tokens.primary : tokens.border,
              }}
              scale={0.97}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: selected ? "#FFFFFF" : tokens.textSecondary }}
              >
                {option.label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

export function PrimaryButton({
  title,
  loading,
  variant = "primary",
  onPress,
}: {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary";
  onPress: () => void;
}) {
  const tokens = useDesignTokens();
  const isSecondary = variant === "secondary";
  return (
    <PressableScale disabled={loading} onPress={onPress}>
      <View
        className="mt-2 rounded-[18px] py-4 items-center justify-center flex-row"
        style={{
          backgroundColor: isSecondary
            ? tokens.backgroundMuted
            : loading
              ? `${tokens.primary}CC`
              : tokens.primary,
          borderWidth: isSecondary ? 1 : 0,
          borderColor: tokens.border,
          minHeight: 52,
          shadowColor: tokens.primary,
          shadowOffset: { width: 0, height: isSecondary ? 0 : 8 },
          shadowOpacity: isSecondary ? 0 : 0.12,
          shadowRadius: 16,
          elevation: isSecondary ? 0 : 4,
        }}
      >
        {loading ? (
          <Animated.View className="mr-2">
            <Ionicons name="sync-outline" size={18} color="#FFFFFF" className="animate-spin" />
          </Animated.View>
        ) : null}
        <Text
          className="text-center text-base font-bold tracking-wide"
          style={{ color: isSecondary ? tokens.text : "#FFFFFF" }}
        >
          {title}
        </Text>
      </View>
    </PressableScale>
  );
}
