import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

import { useDesignTokens } from "@/hooks/useDesignTokens";

export function Skeleton({ className = "h-4 w-full", height = 16 }: { className?: string; height?: number }) {
  const tokens = useDesignTokens();
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 750 }),
        withTiming(0.35, { duration: 750 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      className={`rounded-2xl ${className}`}
      style={[{ height, backgroundColor: tokens.backgroundMuted }, animatedStyle]}
    />
  );
}

export function EmptyState({
  title,
  description,
  icon = "sparkles-outline",
}: {
  title: string;
  description: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const tokens = useDesignTokens();

  return (
    <View
      className="items-center rounded-[24px] px-6 py-10"
      style={{
        borderWidth: 1,
        borderColor: tokens.borderSubtle,
        backgroundColor: tokens.backgroundElevated,
      }}
    >
      <View
        className="mb-4 h-12 w-12 items-center justify-center rounded-[16px]"
        style={{ backgroundColor: tokens.primarySoft }}
      >
        <Ionicons name={icon} size={22} color={tokens.primary} />
      </View>
      <Text className="text-base font-bold tracking-tight" style={{ color: tokens.text }}>
        {title}
      </Text>
      <Text className="mt-2 text-center text-xs leading-5" style={{ color: tokens.textSecondary }}>
        {description}
      </Text>
    </View>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const tokens = useDesignTokens();

  return (
    <View className="mb-4 flex-row items-end justify-between">
      <View className="flex-1 pr-3">
        <Text className="text-lg font-bold tracking-tight" style={{ color: tokens.text }}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-xs font-medium" style={{ color: tokens.textSecondary }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}

export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "success" | "warning" | "danger" | "primary" | "neutral";
}) {
  const tokens = useDesignTokens();
  const palette = {
    success: { bg: tokens.successSoft, text: tokens.success },
    warning: { bg: tokens.warningSoft, text: tokens.warning },
    danger: { bg: tokens.dangerSoft, text: tokens.danger },
    primary: { bg: tokens.primarySoft, text: tokens.primary },
    neutral: { bg: tokens.backgroundMuted, text: tokens.textSecondary },
  }[tone];

  return (
    <View className="rounded-full px-3 py-1" style={{ backgroundColor: palette.bg }}>
      <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: palette.text }}>
        {label}
      </Text>
    </View>
  );
}
