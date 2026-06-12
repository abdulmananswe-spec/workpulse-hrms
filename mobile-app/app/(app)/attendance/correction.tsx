import { Controller, useForm } from "react-hook-form";
import { router } from "expo-router";
import { Alert, Text, View } from "react-native";

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
  { value: "attendance_correction", label: "Attendance Correction" },
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
      subtitle="Submit missed check-in/out or attendance corrections for review."
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
              label="Reason / Evidence Notes"
              value={value}
              onChangeText={onChange}
              multiline
            />
          )}
        />

        <PrimaryButton
          title={submit.isPending ? "Submitting..." : "Submit Request"}
          loading={submit.isPending}
          onPress={() => void handleSubmit(onSubmit)()}
        />
      </FormCard>

      <Text className="mb-3 mt-8 text-lg font-bold" style={{ color: tokens.text }}>
        Recent Requests
      </Text>
      {(corrections.data ?? []).slice(0, 5).map((item) => (
        <View
          key={item.id}
          className="mb-3 rounded-3xl p-4"
          style={{
            backgroundColor: tokens.backgroundElevated,
            borderWidth: 1,
            borderColor: tokens.borderSubtle,
          }}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="font-semibold capitalize" style={{ color: tokens.text }}>
                {item.correction_type.replaceAll("_", " ")}
              </Text>
              <Text className="mt-1 text-sm" style={{ color: tokens.textSecondary }}>
                {item.attendance_date}
              </Text>
            </View>
            <StatusBadge label={item.status} tone={item.status === "approved" ? "success" : "warning"} />
          </View>
        </View>
      ))}
    </SubScreenLayout>
  );
}
