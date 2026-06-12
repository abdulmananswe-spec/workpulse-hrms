import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

import { useDesignTokens } from "@/hooks/useDesignTokens";

type StatCardProps = {
  label: string;
  value: string | number;
  suffix?: string;
  accent?: "primary" | "success" | "warning" | "danger";
};

export function StatCard({ label, value, suffix, accent = "primary" }: StatCardProps) {
  const tokens = useDesignTokens();
  const accentColor = {
    primary: tokens.primary,
    success: tokens.success,
    warning: tokens.warning,
    danger: tokens.danger,
  }[accent];

  return (
    <View
      className="min-w-[46%] flex-1 overflow-hidden rounded-3xl"
      style={{
        borderWidth: 1,
        borderColor: tokens.borderSubtle,
        backgroundColor: tokens.backgroundElevated,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 4,
      }}
    >
      <LinearGradient
        colors={[`${accentColor}14`, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 16 }}
      >
        <Text
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: tokens.textMuted }}
        >
          {label}
        </Text>
        <View className="mt-2 flex-row items-end">
          <Text className="text-3xl font-bold tracking-tight" style={{ color: tokens.text }}>
            {value}
          </Text>
          {suffix ? (
            <Text className="mb-1 ml-1 text-sm font-medium" style={{ color: tokens.textSecondary }}>
              {suffix}
            </Text>
          ) : null}
        </View>
      </LinearGradient>
    </View>
  );
}
