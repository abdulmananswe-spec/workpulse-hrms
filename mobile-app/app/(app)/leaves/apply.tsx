import { Controller, useForm } from "react-hook-form";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSubmitLeave } from "@/hooks/useHrQueries";
import { validateLeaveDates } from "@/lib/validation";
import { LEAVE_TYPE_LABELS, type LeaveType } from "@/types/hr";

type FormValues = {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
};

const leaveTypes = Object.keys(LEAVE_TYPE_LABELS) as LeaveType[];

export default function ApplyLeaveScreen() {
  const submit = useSubmitLeave();
  const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      leaveType: "annual",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      reason: "",
    },
  });

  const selectedType = watch("leaveType");

  async function onSubmit(values: FormValues) {
    const dateError = validateLeaveDates(values.startDate, values.endDate);
    if (dateError) {
      Alert.alert("Invalid dates", dateError);
      return;
    }

    if (!values.reason.trim()) {
      Alert.alert("Required", "Please provide a reason for your leave request.");
      return;
    }

    try {
      await submit.mutateAsync(values);
      Alert.alert("Submitted", "Your leave request has been sent for approval.");
      router.back();
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Unable to submit leave.");
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-muted" edges={["top"]}>
      <ScrollView contentContainerClassName="px-5 pb-10 pt-4">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="font-semibold text-indigo-600">Back</Text>
        </Pressable>
        <Text className="text-3xl font-bold text-slate-900">Apply Leave</Text>

        <View className="mt-6 rounded-3xl bg-white p-5 shadow-premium">
          <Text className="mb-3 text-sm font-semibold text-slate-700">Leave Category</Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {leaveTypes.map((type) => (
              <Pressable
                key={type}
                onPress={() => setValue("leaveType", type)}
                className={`rounded-full px-4 py-2 ${
                  selectedType === type ? "bg-indigo-600" : "bg-slate-100"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedType === type ? "text-white" : "text-slate-600"
                  }`}
                >
                  {LEAVE_TYPE_LABELS[type]}
                </Text>
              </Pressable>
            ))}
          </View>

          <Controller
            control={control}
            name="startDate"
            render={({ field: { value, onChange } }) => (
              <Field label="Start Date (YYYY-MM-DD)" value={value} onChangeText={onChange} />
            )}
          />
          <Controller
            control={control}
            name="endDate"
            render={({ field: { value, onChange } }) => (
              <Field label="End Date (YYYY-MM-DD)" value={value} onChangeText={onChange} />
            )}
          />
          <Controller
            control={control}
            name="reason"
            render={({ field: { value, onChange } }) => (
              <Field label="Reason" value={value} onChangeText={onChange} multiline />
            )}
          />

          <Pressable
            disabled={submit.isPending}
            onPress={() => void handleSubmit(onSubmit)()}
            className={`mt-2 rounded-2xl py-4 ${submit.isPending ? "bg-indigo-400" : "bg-indigo-600"}`}
          >
            <Text className="text-center text-base font-bold text-white">
              {submit.isPending ? "Submitting..." : "Submit Leave Request"}
            </Text>
          </Pressable>
        </View>
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
