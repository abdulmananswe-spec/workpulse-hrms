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
  const gradient = colors ?? ([tokens.primary, tokens.primaryDark] as const);

  return (
    <PressableScale disabled={disabled} onPress={onPress} style={{ marginBottom: 12 }} scale={0.97} haptic>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 24,
          padding: 20,
          shadowColor: gradient[0],
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center">
          <View
            className="mr-4 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "rgba(255,255,255,0.16)", width: 44, height: 44 }}
          >
            <Ionicons name={icon} size={20} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-black tracking-tight text-white">{title}</Text>
            <Text className="mt-0.5 text-xs text-white/80 font-medium">{subtitle}</Text>
          </View>
          <View className="h-8 w-8 rounded-full items-center justify-center bg-white/10">
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </View>
        </View>
      </LinearGradient>
    </PressableScale>
  );
}
