import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { useDesignTokens } from "@/hooks/useDesignTokens";

type ListRowProps = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  trailing?: ReactNode;
};

export function ListRow({ title, subtitle, icon, onPress, trailing }: ListRowProps) {
  const tokens = useDesignTokens();

  const content = (
    <View
      className="mb-3 flex-row items-center rounded-[20px] px-4 py-3.5 border"
      style={{
        backgroundColor: tokens.backgroundElevated,
        borderColor: tokens.border,
      }}
    >
      {icon ? (
        <View
          className="mr-3 h-10 w-10 items-center justify-center rounded-[12px]"
          style={{ backgroundColor: tokens.primarySoft }}
        >
          <Ionicons name={icon} size={18} color={tokens.primary} />
        </View>
      ) : null}
      <View className="flex-1">
        <Text className="text-sm font-bold tracking-tight" style={{ color: tokens.text }}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-xs font-semibold" style={{ color: tokens.textSecondary }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ?? (
        <View className="h-7 w-7 rounded-full items-center justify-center bg-zinc-50 dark:bg-zinc-800">
          <Ionicons name="chevron-forward" size={14} color={tokens.textMuted} />
        </View>
      )}
    </View>
  );

  if (!onPress) return content;
  return <PressableScale onPress={onPress} scale={0.98} haptic>{content}</PressableScale>;
}
