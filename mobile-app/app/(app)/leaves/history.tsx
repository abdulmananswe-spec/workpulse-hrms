import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui/Feedback";
import { useCancelLeave, useLeaveRequests } from "@/hooks/useHrQueries";
import { LEAVE_TYPE_LABELS, type LeaveRequest } from "@/types/hr";

const sections = ["pending", "approved", "rejected", "cancelled"] as const;

export default function LeaveHistoryScreen() {
  const requests = useLeaveRequests();
  const cancelLeave = useCancelLeave();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  function handleCancel(item: LeaveRequest) {
    Alert.alert(
      "Cancel Leave Request",
      "Are you sure you want to cancel this pending leave request?",
      [
        { text: "Keep Request", style: "cancel" },
        {
          text: "Cancel Leave",
          style: "destructive",
          onPress: () => {
            setCancellingId(item.id);
            cancelLeave.mutate(item.id, {
              onSettled: () => setCancellingId(null),
              onError: (error) => {
                Alert.alert(
                  "Unable to Cancel",
                  error instanceof Error ? error.message : "Please try again.",
                );
              },
            });
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-muted" edges={["top"]}>
      <ScrollView contentContainerClassName="px-5 pb-10 pt-4">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="font-semibold text-indigo-600">Back</Text>
        </Pressable>
        <Text className="text-3xl font-bold text-slate-900">Leave History</Text>

        {sections.map((status) => {
          const items = (requests.data ?? []).filter((item) => item.status === status);
          return (
            <View key={status} className="mt-8">
              <Text className="mb-3 text-lg font-bold capitalize text-slate-900">
                {status}
              </Text>
              {items.length === 0 ? (
                <EmptyState
                  title={`No ${status} requests`}
                  description="Your leave requests will appear here."
                />
              ) : (
                items.map((item) => (
                  <View key={item.id} className="mb-3 rounded-2xl bg-white p-4 shadow-premium">
                    <Text className="font-semibold text-slate-900">
                      {LEAVE_TYPE_LABELS[item.leave_type]}
                    </Text>
                    <Text className="mt-1 text-sm text-slate-500">
                      {item.start_date} to {item.end_date}
                    </Text>
                    {item.reason ? (
                      <Text className="mt-2 text-sm text-slate-600">{item.reason}</Text>
                    ) : null}
                    {item.admin_remarks ? (
                      <View className="mt-3 rounded-xl bg-slate-50 p-3">
                        <Text className="text-xs font-semibold uppercase text-slate-500">
                          Admin Remarks
                        </Text>
                        <Text className="mt-1 text-sm text-slate-700">
                          {item.admin_remarks}
                        </Text>
                      </View>
                    ) : null}
                    {status === "pending" ? (
                      <Pressable
                        onPress={() => handleCancel(item)}
                        disabled={cancellingId === item.id}
                        className="mt-4 items-center rounded-xl border border-rose-200 bg-rose-50 py-3"
                      >
                        {cancellingId === item.id ? (
                          <ActivityIndicator color="#e11d48" />
                        ) : (
                          <Text className="font-semibold text-rose-600">
                            Cancel Request
                          </Text>
                        )}
                      </Pressable>
                    ) : null}
                  </View>
                ))
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
