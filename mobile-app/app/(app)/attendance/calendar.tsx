import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMonthlyAttendance } from "@/hooks/useHrQueries";
import { toDateKey } from "@/lib/format";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AttendanceCalendarScreen() {
  const monthQuery = useMonthlyAttendance();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const presentDays = new Set(
    (monthQuery.data ?? [])
      .filter((record) => record.check_in_time)
      .map((record) => toDateKey(new Date(record.created_at))),
  );

  const cells: Array<number | null> = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface-muted" edges={["top"]}>
      <ScrollView contentContainerClassName="px-5 pb-10 pt-4">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="font-semibold text-indigo-600">Back</Text>
        </Pressable>
        <Text className="text-3xl font-bold text-slate-900">Attendance Calendar</Text>
        <Text className="mt-1 text-sm text-slate-500">
          {MONTH_NAMES[month]} {year}
        </Text>

        <View className="mt-6 flex-row flex-wrap">
          {cells.map((day, index) => {
            if (!day) {
              return <View key={`empty-${index}`} className="mb-3 h-12 w-[14.28%]" />;
            }

            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isPresent = presentDays.has(dateKey);
            const isFuture = day > now.getDate();

            return (
              <View key={dateKey} className="mb-3 w-[14.28%] items-center">
                <View
                  className={`h-10 w-10 items-center justify-center rounded-2xl ${
                    isPresent
                      ? "bg-emerald-100"
                      : isFuture
                        ? "bg-slate-100"
                        : "bg-rose-100"
                  }`}
                >
                  <Text className="font-semibold text-slate-800">{day}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View className="mt-4 flex-row gap-4">
          <Legend color="bg-emerald-100" label="Present" />
          <Legend color="bg-rose-100" label="Absent" />
          <Legend color="bg-amber-100" label="Leave" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center">
      <View className={`mr-2 h-3 w-3 rounded-full ${color}`} />
      <Text className="text-sm text-slate-600">{label}</Text>
    </View>
  );
}
