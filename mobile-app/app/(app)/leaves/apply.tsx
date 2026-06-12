import { Controller, useForm } from "react-hook-form";
import { router } from "expo-router";
import { Alert } from "react-native";

import { ChipSelect, FormField, PrimaryButton } from "@/components/ui/FormField";
import { FormCard, SubScreenLayout } from "@/components/ui/SubScreenLayout";
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
    <SubScreenLayout
      title="Apply Leave"
      subtitle="Submit a professional leave request for manager approval."
      onBack={() => router.back()}
    >
      <FormCard>
        <ChipSelect
          label="Leave Category"
          options={leaveTypes.map((type) => ({ value: type, label: LEAVE_TYPE_LABELS[type] }))}
          value={selectedType}
          onChange={(value) => setValue("leaveType", value)}
        />

        <Controller
          control={control}
          name="startDate"
          render={({ field: { value, onChange } }) => (
            <FormField label="Start Date (YYYY-MM-DD)" value={value} onChangeText={onChange} />
          )}
        />
        <Controller
          control={control}
          name="endDate"
          render={({ field: { value, onChange } }) => (
            <FormField label="End Date (YYYY-MM-DD)" value={value} onChangeText={onChange} />
          )}
        />
        <Controller
          control={control}
          name="reason"
          render={({ field: { value, onChange } }) => (
            <FormField label="Reason" value={value} onChangeText={onChange} multiline />
          )}
        />

        <PrimaryButton
          title={submit.isPending ? "Submitting..." : "Submit Leave Request"}
          loading={submit.isPending}
          onPress={() => void handleSubmit(onSubmit)()}
        />
      </FormCard>
    </SubScreenLayout>
  );
}
