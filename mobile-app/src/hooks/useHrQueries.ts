import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import {
  checkIn as performCheckIn,
  checkOut as performCheckOut,
  fetchTodayAttendance,
  fetchAttendanceHistory,
} from "@/services/attendance";
import {
  fetchAttendanceStats,
  fetchLeaveBalances,
  fetchLeaveRequests,
  fetchMonthlyAttendance,
  submitLeaveRequest,
  cancelLeaveRequest,
  buildAchievements,
} from "@/services/hr";
import {
  fetchCorrectionRequests,
  submitCorrectionRequest,
} from "@/services/corrections";
import {
  fetchAnnouncements,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notifications";
import { fetchOrgSettings, formatDutyTime } from "@/services/orgSettings";
import type { LeaveType, CorrectionType } from "@/types/hr";

export function useOrgSettings() {
  return useQuery({
    queryKey: ["org-settings"],
    queryFn: fetchOrgSettings,
    staleTime: 5 * 60_000,
  });
}

export { formatDutyTime };

export function useTodayAttendance() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["attendance", "today", profile?.id],
    queryFn: () => fetchTodayAttendance(profile!.id),
    enabled: Boolean(profile?.id),
  });
}

export function useAttendanceHistory(limit = 30) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["attendance", "history", profile?.id, limit],
    queryFn: () => fetchAttendanceHistory(profile!.id, limit),
    enabled: Boolean(profile?.id),
  });
}

export function useMonthlyAttendance(reference = new Date()) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["attendance", "month", profile?.id, reference.getMonth()],
    queryFn: () => fetchMonthlyAttendance(profile!.id, reference),
    enabled: Boolean(profile?.id),
  });
}

export function useAttendanceStats() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["attendance", "stats", profile?.id],
    queryFn: () => fetchAttendanceStats(profile!.id),
    enabled: Boolean(profile?.id),
  });
}

export function useCheckInOut() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["attendance"] });
  }, [queryClient]);

  const checkIn = useCallback(async () => {
    if (!profile?.id) throw new Error("Not authenticated");
    if (isPending) return;
    setIsPending(true);
    try {
      const result = await performCheckIn(profile.id);
      invalidate();
      return result;
    } finally {
      setIsPending(false);
    }
  }, [profile?.id, isPending, invalidate]);

  const checkOut = useCallback(async () => {
    if (!profile?.id) throw new Error("Not authenticated");
    if (isPending) return;
    setIsPending(true);
    try {
      const result = await performCheckOut(profile.id);
      invalidate();
      return result;
    } finally {
      setIsPending(false);
    }
  }, [profile?.id, isPending, invalidate]);

  return { checkIn, checkOut, isPending };
}

export function useLeaveBalances() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["leaves", "balances", profile?.id],
    queryFn: () => fetchLeaveBalances(profile!.id),
    enabled: Boolean(profile?.id),
  });
}

export function useLeaveRequests() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["leaves", "requests", profile?.id],
    queryFn: () => fetchLeaveRequests(profile!.id),
    enabled: Boolean(profile?.id),
  });
}

export function useSubmitLeave() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: (input: {
      leaveType: LeaveType;
      startDate: string;
      endDate: string;
      reason: string;
    }) =>
      submitLeaveRequest({
        employeeId: profile!.id,
        leaveType: input.leaveType,
        startDate: input.startDate,
        endDate: input.endDate,
        reason: input.reason,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}

export function useCancelLeave() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: (leaveRequestId: string) =>
      cancelLeaveRequest(profile!.id, leaveRequestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}

export function useCorrections() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["corrections", profile?.id],
    queryFn: () => fetchCorrectionRequests(profile!.id),
    enabled: Boolean(profile?.id),
  });
}

export function useSubmitCorrection() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: (input: {
      correctionType: CorrectionType;
      attendanceDate: string;
      requestedCheckIn?: string | null;
      requestedCheckOut?: string | null;
      reason: string;
    }) =>
      submitCorrectionRequest({
        employeeId: profile!.id,
        ...input,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["corrections"] });
    },
  });
}

export function useNotifications() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["notifications", profile?.id],
    queryFn: () => fetchNotifications(profile!.id),
    enabled: Boolean(profile?.id),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(profile!.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
  });
}

export function useAchievements() {
  const stats = useAttendanceStats();
  return {
    ...stats,
    achievements: stats.data ? buildAchievements(stats.data) : [],
  };
}
