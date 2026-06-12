import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { useDesignTokens } from "@/hooks/useDesignTokens";

type QuickActionCardProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors?: readonly [string, string];
  onPress: () => void;
  disabled?: boolean;
};

export function QuickActionCard({
  title,
  subtitle,
  icon,
  colors,
  onPress,
  disabled,
}: QuickActionCardProps) {
  const tokens = useDesignTokens();
  const gradient = colors ?? ([tokens.primary, tokens.accent] as const);

  return (
    <PressableScale disabled={disabled} onPress={onPress} style={{ marginBottom: 12 }}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 22, padding: 18 }}
      >
        <View className="flex-row items-center">
          <View
            className="mr-4 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "rgba(255,255,255,0.18)", width: 48, height: 48 }}
          >
            <Ionicons name={icon} size={22} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-white">{title}</Text>
            <Text className="mt-1 text-sm text-white/80">{subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.9)" />
        </View>
      </LinearGradient>
    </PressableScale>
  );
}
