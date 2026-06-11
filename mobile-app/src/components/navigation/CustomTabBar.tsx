import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabs: Array<{
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
}> = [
  { name: "index", label: "Home", icon: "home-outline", iconFocused: "home" },
  { name: "attendance", label: "Attendance", icon: "time-outline", iconFocused: "time" },
  { name: "leaves", label: "Leaves", icon: "calendar-outline", iconFocused: "calendar" },
  { name: "notifications", label: "Alerts", icon: "notifications-outline", iconFocused: "notifications" },
  { name: "profile", label: "Profile", icon: "person-outline", iconFocused: "person" },
];

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-t border-slate-200 bg-white/95 px-2 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}
    >
      <View className="relative flex-row items-center justify-between rounded-[28px] bg-slate-50 px-1 py-1">
        {state.routes.map((route, index) => {
          const tab = tabs.find((item) => item.name === route.name);
          if (!tab) return null;

          const isFocused = state.index === index;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
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
              {isFocused ? (
                <View className="absolute inset-x-1 inset-y-0 rounded-[22px] bg-white shadow-premium" />
              ) : null}
              <View className="items-center">
                <Ionicons
                  name={isFocused ? tab.iconFocused : tab.icon}
                  size={20}
                  color={isFocused ? "#4f46e5" : "#94a3b8"}
                />
                <Text
                  className={`mt-1 text-[11px] font-semibold ${
                    isFocused ? "text-indigo-600" : "text-slate-400"
                  }`}
                >
                  {tab.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
