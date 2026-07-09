import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { useDesignTokens } from "@/hooks/useDesignTokens";
import { useTheme } from "@/providers/ThemeProvider";

const tabs: Array<{
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
}> = [
  { name: "index", label: "Home", icon: "home-outline", iconFocused: "home" },
  { name: "attendance", label: "Time", icon: "time-outline", iconFocused: "time" },
  { name: "leaves", label: "Leave", icon: "calendar-outline", iconFocused: "calendar" },
  { name: "notifications", label: "Inbox", icon: "notifications-outline", iconFocused: "notifications" },
  { name: "profile", label: "Profile", icon: "person-outline", iconFocused: "person" },
];

const SUB_SCREENS = new Set([
  "settings",
  "branch",
  "announcements",
  "apply",
  "history",
  "calendar",
  "correction",
]);

export function useTabBarVisible() {
  const segments = useSegments();
  const last = segments[segments.length - 1];
  return !SUB_SCREENS.has(last ?? "");
}

export function useTabBarClearance() {
  const insets = useSafeAreaInsets();
  const visible = useTabBarVisible();
  if (!visible) return Math.max(insets.bottom, 16) + 24;
  const TAB_BAR_HEIGHT = 72;
  const FLOATING_GAP = 12;
  return TAB_BAR_HEIGHT + Math.max(insets.bottom, 12) + FLOATING_GAP + 32;
}

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const tokens = useDesignTokens();
  const visible = useTabBarVisible();

  const [containerWidth, setContainerWidth] = useState(0);
  const tabWidth = containerWidth ? (containerWidth - 16) / state.routes.length : 0;
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (tabWidth > 0) {
      translateX.value = withSpring(8 + state.index * tabWidth, {
        damping: 18,
        stiffness: 150,
      });
    }
  }, [state.index, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      width: tabWidth,
    };
  });

  if (!visible) return null;

  return (
    <View
      className="absolute bottom-0 left-0 right-0 px-4"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={isDark ? 28 : 40}
        tint={isDark ? "dark" : "light"}
        style={{
          borderRadius: 28,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: tokens.borderSubtle,
        }}
      >
        <View
          className="flex-row items-center px-2 py-2 relative"
          style={{ backgroundColor: tokens.tabBar }}
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
          {tabWidth > 0 ? (
            <Animated.View
              style={[
                indicatorStyle,
                {
                  position: "absolute",
                  top: 8,
                  bottom: 8,
                  borderRadius: 20,
                  backgroundColor: tokens.primarySoft,
                },
              ]}
            />
          ) : null}

          {state.routes.map((route, index) => {
            const tab = tabs.find((item) => item.name === route.name);
            if (!tab) return null;

            const isFocused = state.index === index;

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={() => {
                  void Haptics.selectionAsync();
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
                className="relative flex-1 items-center py-2"
              >
                <View className="items-center">
                  <Ionicons
                    name={isFocused ? tab.iconFocused : tab.icon}
                    size={21}
                    color={isFocused ? tokens.primary : tokens.textMuted}
                  />
                  <Text
                    className="mt-1 text-[10px] font-bold"
                    style={{ color: isFocused ? tokens.primary : tokens.textMuted }}
                  >
                    {tab.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}
