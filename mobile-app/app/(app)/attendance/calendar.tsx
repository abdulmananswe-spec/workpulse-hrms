import { router } from "expo-router";
import { Text, View } from "react-native";

import { FormCard, SubScreenLayout } from "@/components/ui/SubScreenLayout";
import { useDesignTokens } from "@/hooks/useDesignTokens";
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
  const tokens = useDesignTokens();
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
    <SubScreenLayout
      title="Attendance Calendar"
      subtitle={`${MONTH_NAMES[month]} ${year}`}
      onBack={() => router.back()}
    >
      <FormCard>
        <View className="flex-row flex-wrap">
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
                  className="h-10 w-10 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: isPresent
                      ? tokens.successSoft
                      : isFuture
                        ? tokens.backgroundMuted
                        : tokens.dangerSoft,
                  }}
                >
                  <Text className="font-semibold" style={{ color: tokens.text }}>
                    {day}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View className="mt-4 flex-row flex-wrap gap-4">
          <Legend color={tokens.successSoft} label="Present" textColor={tokens.textSecondary} />
          <Legend color={tokens.dangerSoft} label="Absent" textColor={tokens.textSecondary} />
          <Legend color={tokens.warningSoft} label="Leave" textColor={tokens.textSecondary} />
        </View>
      </FormCard>
    </SubScreenLayout>
  );
}

function Legend({
  color,
  label,
  textColor,
}: {
  color: string;
  label: string;
  textColor: string;
}) {
  return (
    <View className="flex-row items-center">
      <View className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-sm" style={{ color: textColor }}>
        {label}
      </Text>
    </View>
  );
}
