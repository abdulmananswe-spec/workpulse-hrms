import { Text, View } from "react-native";

export function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
  return <View className={`animate-pulse rounded-xl bg-slate-200 ${className}`} />;
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View className="items-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-10">
      <Text className="text-lg font-semibold text-slate-900">{title}</Text>
      <Text className="mt-2 text-center text-sm text-slate-500">{description}</Text>
    </View>
  );
}
