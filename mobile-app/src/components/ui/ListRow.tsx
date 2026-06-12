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
      className="mb-3 flex-row items-center rounded-3xl px-4 py-4"
      style={{
        backgroundColor: tokens.backgroundElevated,
        borderWidth: 1,
        borderColor: tokens.borderSubtle,
      }}
    >
      {icon ? (
        <View
          className="mr-3 h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: tokens.primarySoft }}
        >
          <Ionicons name={icon} size={20} color={tokens.primary} />
        </View>
      ) : null}
      <View className="flex-1">
        <Text className="text-base font-semibold" style={{ color: tokens.text }}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1 text-sm" style={{ color: tokens.textSecondary }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ?? <Ionicons name="chevron-forward" size={18} color={tokens.textMuted} />}
    </View>
  );

  if (!onPress) return content;
  return <PressableScale onPress={onPress}>{content}</PressableScale>;
}
