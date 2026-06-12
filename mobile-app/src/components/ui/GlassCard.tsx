import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { useDesignTokens } from "@/hooks/useDesignTokens";
import { useTheme } from "@/providers/ThemeProvider";

type GlassCardProps = ViewProps & {
  children: ReactNode;
  className?: string;
  padded?: boolean;
};

export function GlassCard({ children, className = "", padded = true, style, ...props }: GlassCardProps) {
  const { isDark } = useTheme();
  const tokens = useDesignTokens();

  const shellStyle = {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: tokens.borderSubtle,
    backgroundColor: tokens.backgroundElevated,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: isDark ? 0.35 : 0.08,
    shadowRadius: 24,
    elevation: 8,
    overflow: "hidden" as const,
  };

  if (isDark) {
    return (
      <View className={`overflow-hidden ${className}`} style={[shellStyle, style]} {...props}>
        <View className={padded ? "p-5" : ""}>{children}</View>
      </View>
    );
  }

  return (
    <View className={`overflow-hidden ${className}`} style={[shellStyle, style]} {...props}>
      <BlurView intensity={24} tint="light">
        <View className={padded ? "p-5" : ""}>{children}</View>
      </BlurView>
    </View>
  );
}
