import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

type StatCardProps = {
  label: string;
  value: string | number;
  suffix?: string;
  colors?: [string, string];
};

export function StatCard({
  label,
  value,
  suffix,
  colors = ["#eef2ff", "#ffffff"],
}: StatCardProps) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="min-w-[46%] flex-1 rounded-3xl border border-indigo-100 p-4 shadow-premium"
    >
      <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </Text>
      <View className="mt-2 flex-row items-end">
        <Text className="text-3xl font-bold text-slate-900">{value}</Text>
        {suffix ? (
          <Text className="mb-1 ml-1 text-sm font-medium text-slate-500">{suffix}</Text>
        ) : null}
      </View>
    </LinearGradient>
  );
}
