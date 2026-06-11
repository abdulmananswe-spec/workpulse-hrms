import { Controller, useForm } from "react-hook-form";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView className="flex-1 bg-surface-muted" edges={["top"]}>
      <ScrollView contentContainerClassName="px-5 pb-10 pt-4">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="font-semibold text-indigo-600">Back</Text>
        </Pressable>
        <Text className="text-3xl font-bold text-slate-900">Attendance Correction</Text>
        <Text className="mt-1 text-sm text-slate-500">
          Submit missed check-in/out or attendance corrections for review.
        </Text>

        <View className="mt-6 rounded-3xl bg-white p-5 shadow-premium">
          <Text className="mb-3 text-sm font-semibold text-slate-700">Request Type</Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {types.map((type) => (
              <Pressable
                key={type.value}
                onPress={() => setValue("correctionType", type.value)}
                className={`rounded-full px-4 py-2 ${
                  selectedType === type.value ? "bg-indigo-600" : "bg-slate-100"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedType === type.value ? "text-white" : "text-slate-600"
                  }`}
                >
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Controller
            control={control}
            name="attendanceDate"
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <Field label="Date (YYYY-MM-DD)" value={value} onChangeText={onChange} />
            )}
          />

          <Controller
            control={control}
            name="reason"
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <Field
                label="Reason / Evidence Notes"
                value={value}
                onChangeText={onChange}
                multiline
              />
            )}
          />

          <Pressable
            onPress={() => void handleSubmit(onSubmit)()}
            className="mt-4 rounded-2xl bg-indigo-600 py-4"
          >
            <Text className="text-center text-base font-bold text-white">
              {submit.isPending ? "Submitting..." : "Submit Request"}
            </Text>
          </Pressable>
        </View>

        <Text className="mb-3 mt-8 text-lg font-bold text-slate-900">Recent Requests</Text>
        {(corrections.data ?? []).slice(0, 5).map((item) => (
          <View key={item.id} className="mb-3 rounded-2xl bg-white p-4 shadow-premium">
            <Text className="font-semibold capitalize text-slate-900">
              {item.correction_type.replaceAll("_", " ")}
            </Text>
            <Text className="mt-1 text-sm text-slate-500">{item.attendance_date}</Text>
            <Text className="mt-2 text-sm capitalize text-indigo-600">{item.status}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-slate-700">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
      />
    </View>
  );
}
