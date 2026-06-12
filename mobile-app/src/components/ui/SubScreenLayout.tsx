import type { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTabBarClearance } from "@/components/navigation/CustomTabBar";
import { useDesignTokens } from "@/hooks/useDesignTokens";

type SubScreenLayoutProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: ReactNode;
};

export function SubScreenLayout({ title, subtitle, onBack, children }: SubScreenLayoutProps) {
  const tokens = useDesignTokens();
  const bottomPad = useTabBarClearance();

  return (
    <SafeAreaView className="flex-1" edges={["top"]} style={{ backgroundColor: tokens.background }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={onBack} className="mb-4 flex-row items-center self-start">
          <Ionicons name="chevron-back" size={20} color={tokens.primary} />
          <Text className="ml-1 font-semibold" style={{ color: tokens.primary }}>
            Back
          </Text>
        </Pressable>
        <Text className="text-3xl font-bold tracking-tight" style={{ color: tokens.text }}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1 text-sm leading-5" style={{ color: tokens.textSecondary }}>
            {subtitle}
          </Text>
        ) : null}
        <View className="mt-6">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function FormCard({ children }: { children: ReactNode }) {
  const tokens = useDesignTokens();
  return (
    <View
      className="rounded-3xl p-5"
      style={{
        backgroundColor: tokens.backgroundElevated,
        borderWidth: 1,
        borderColor: tokens.borderSubtle,
      }}
    >
      {children}
    </View>
  );
}
