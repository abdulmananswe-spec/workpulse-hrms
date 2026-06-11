import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Pressable, Text, View } from "react-native";

type QuickActionCardProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors?: [string, string];
  onPress: () => void;
  disabled?: boolean;
};

export function QuickActionCard({
  title,
  subtitle,
  icon,
  colors = ["#4f46e5", "#7c3aed"],
  onPress,
  disabled,
}: QuickActionCardProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      className={`mb-3 overflow-hidden rounded-3xl ${disabled ? "opacity-50" : ""}`}
    >
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="p-4">
        <View className="flex-row items-center">
          <View className="mr-4 rounded-2xl bg-white/20 p-3">
            <Ionicons name={icon} size={22} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-white">{title}</Text>
            <Text className="mt-1 text-sm text-white/80">{subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ffffff" />
        </View>
      </LinearGradient>
    </Pressable>
  );
}
