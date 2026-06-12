import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { useDesignTokens } from "@/hooks/useDesignTokens";

export function Skeleton({ className = "h-4 w-full", height = 16 }: { className?: string; height?: number }) {
  const tokens = useDesignTokens();
  return (
    <View
      className={`rounded-2xl ${className}`}
      style={{ height, backgroundColor: tokens.backgroundMuted }}
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
      className="items-center rounded-3xl px-6 py-12"
      style={{
        borderWidth: 1,
        borderColor: tokens.borderSubtle,
        backgroundColor: tokens.backgroundElevated,
      }}
    >
      <View
        className="mb-4 h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: tokens.primarySoft }}
      >
        <Ionicons name={icon} size={26} color={tokens.primary} />
      </View>
      <Text className="text-lg font-bold" style={{ color: tokens.text }}>
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm leading-5" style={{ color: tokens.textSecondary }}>
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
        <Text className="text-2xl font-bold tracking-tight" style={{ color: tokens.text }}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1 text-sm" style={{ color: tokens.textSecondary }}>
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
      <Text className="text-xs font-semibold capitalize" style={{ color: palette.text }}>
        {label}
      </Text>
    </View>
  );
}
