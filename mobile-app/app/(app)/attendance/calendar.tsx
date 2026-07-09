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

const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"];

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
        {/* Days of the week header */}
        <View className="flex-row mb-5 border-b pb-2.5" style={{ borderColor: tokens.border }}>
          {DAYS_OF_WEEK.map((day, idx) => (
            <Text
              key={`day-header-${idx}`}
              className="w-[14.28%] text-center text-xs font-black uppercase tracking-wider"
              style={{ color: tokens.textMuted }}
            >
              {day}
            </Text>
          ))}
        </View>

        <View className="flex-row flex-wrap">
          {cells.map((day, index) => {
            if (!day) {
              return <View key={`empty-${index}`} className="mb-4 h-11 w-[14.28%]" />;
            }

            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isPresent = presentDays.has(dateKey);
            const isFuture = day > now.getDate();
            const isToday = day === now.getDate();

            let cellBg: string = tokens.dangerSoft;
            let textStyle: { color: string; fontWeight: "500" | "700" } = {
              color: tokens.danger,
              fontWeight: "700" as const,
            };

            if (isPresent) {
              cellBg = tokens.successSoft;
              textStyle = { color: tokens.success, fontWeight: "700" as const };
            } else if (isFuture) {
              cellBg = tokens.backgroundMuted;
              textStyle = { color: tokens.textMuted, fontWeight: "500" as const };
            }

            return (
              <View key={dateKey} className="mb-4 w-[14.28%] items-center">
                <View
                  className="h-11 w-11 items-center justify-center rounded-[14px]"
                  style={{
                    backgroundColor: cellBg,
                    borderWidth: isToday ? 2 : 0,
                    borderColor: tokens.primary,
                  }}
                >
                  <Text className="text-xs" style={textStyle}>
                    {day}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View className="mt-6 flex-row flex-wrap gap-4 border-t pt-4" style={{ borderColor: tokens.border }}>
          <Legend color={tokens.success} label="Present" textColor={tokens.textSecondary} />
          <Legend color={tokens.danger} label="Absent" textColor={tokens.textSecondary} />
          <Legend color={tokens.backgroundMuted} label="Future" textColor={tokens.textSecondary} />
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
      <View className="mr-2 h-3.5 w-3.5 rounded-[6px]" style={{ backgroundColor: color }} />
      <Text className="text-xs font-bold uppercase tracking-wider" style={{ color: textColor }}>
        {label}
      </Text>
    </View>
  );
}
