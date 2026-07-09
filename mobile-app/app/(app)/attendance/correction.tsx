import { Controller, useForm } from "react-hook-form";
import { router } from "expo-router";
import { Alert, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ChipSelect, FormField, PrimaryButton } from "@/components/ui/FormField";
import { StatusBadge } from "@/components/ui/Feedback";
import { FormCard, SubScreenLayout } from "@/components/ui/SubScreenLayout";
import { useDesignTokens } from "@/hooks/useDesignTokens";
import { useCorrections, useSubmitCorrection } from "@/hooks/useHrQueries";
import type { CorrectionType } from "@/types/hr";

type FormValues = {
  correctionType: CorrectionType;
  attendanceDate: string;
  reason: string;
};

const types: Array<{ value: CorrectionType; label: string }> = [
  { value: "missed_check_in", label: "Missed Check-In" },
  { value: "missed_check_out", label: "Missed Check-Out" },
  { value: "attendance_correction", label: "Correction" },
];

export default function CorrectionScreen() {
  const tokens = useDesignTokens();
  const submit = useSubmitCorrection();
  const corrections = useCorrections();
  const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      correctionType: "missed_check_in",
      attendanceDate: new Date().toISOString().slice(0, 10),
      reason: "",
    },
  });

  const selectedType = watch("correctionType");

  async function onSubmit(values: FormValues) {
    try {
      await submit.mutateAsync({
        correctionType: values.correctionType,
        attendanceDate: values.attendanceDate,
        reason: values.reason,
      });
      Alert.alert("Submitted", "Your correction request has been sent for approval.");
      router.back();
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Unable to submit.");
    }
  }

  return (
    <SubScreenLayout
      title="Attendance Correction"
      subtitle="Submit shift entries or missed punches to HR for review."
      onBack={() => router.back()}
    >
      <FormCard>
        <ChipSelect
          label="Request Type"
          options={types}
          value={selectedType}
          onChange={(value) => setValue("correctionType", value)}
        />

        <Controller
          control={control}
          name="attendanceDate"
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <FormField label="Date (YYYY-MM-DD)" value={value} onChangeText={onChange} />
          )}
        />

        <Controller
          control={control}
          name="reason"
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <FormField
              label="Reason / Notes"
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
              style={{ textAlignVertical: "top", minHeight: 80 }}
            />
          )}
        />

        <PrimaryButton
          title={submit.isPending ? "Submitting..." : "Submit Request"}
          loading={submit.isPending}
          onPress={() => void handleSubmit(onSubmit)()}
        />
      </FormCard>

      <Text className="mb-4 mt-8 text-base font-black tracking-tight" style={{ color: tokens.text }}>
        Recent Correction Logs
      </Text>
      {corrections.isLoading ? (
        <View className="space-y-3">
          <View className="h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <View className="h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </View>
      ) : (corrections.data ?? []).length === 0 ? (
        <View className="rounded-3xl p-6 items-center border" style={{ backgroundColor: tokens.backgroundElevated, borderColor: tokens.border }}>
          <Text className="text-xs font-semibold" style={{ color: tokens.textMuted }}>No request history found.</Text>
        </View>
      ) : (
        (corrections.data ?? []).slice(0, 5).map((item) => (
          <View
            key={item.id}
            className="mb-3 rounded-[20px] p-4 border"
            style={{
              backgroundColor: tokens.backgroundElevated,
              borderColor: tokens.border,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3 flex-row items-center">
                <View className="h-9 w-9 rounded-xl items-center justify-center bg-zinc-100 dark:bg-zinc-800 mr-3">
                  <Ionicons name="construct-outline" size={16} color={tokens.textSecondary} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold capitalize tracking-tight" style={{ color: tokens.text }}>
                    {item.correction_type.replaceAll("_", " ")}
                  </Text>
                  <Text className="mt-0.5 text-[10px] font-semibold" style={{ color: tokens.textMuted }}>
                    {item.attendance_date}
                  </Text>
                </View>
              </View>
              <StatusBadge
                label={item.status}
                tone={
                  item.status === "approved"
                    ? "success"
                    : item.status === "rejected"
                      ? "danger"
                      : "warning"
                }
              />
            </View>
            {item.reason ? (
              <View className="mt-3 border-t pt-2" style={{ borderColor: tokens.borderSubtle }}>
                <Text className="text-xs italic" style={{ color: tokens.textSecondary }}>
                  "{item.reason}"
                </Text>
              </View>
            ) : null}
          </View>
        ))
      )}
    </SubScreenLayout>
  );
}
