import type { ReactNode } from "react";
import { RefreshControl, ScrollView, View, type RefreshControlProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTabBarClearance } from "@/components/navigation/CustomTabBar";
import { useDesignTokens } from "@/hooks/useDesignTokens";

type ScreenShellProps = {
  children: ReactNode;
  hero?: ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  contentClassName?: string;
};

export function ScreenShell({
  children,
  hero,
  refreshControl,
  contentClassName = "px-5 pt-2",
}: ScreenShellProps) {
  const tokens = useDesignTokens();
  const bottomPad = useTabBarClearance();

  return (
    <View className="flex-1" style={{ backgroundColor: tokens.background }}>
      {hero}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: bottomPad }}
        contentContainerClassName={contentClassName}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function ScreenSafeTop({ children }: { children: ReactNode }) {
  const tokens = useDesignTokens();
  return (
    <SafeAreaView className="flex-1" edges={["top"]} style={{ backgroundColor: tokens.background }}>
      {children}
    </SafeAreaView>
  );
}
