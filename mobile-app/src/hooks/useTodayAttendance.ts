import { useCallback, useEffect, useState } from "react";

import {
  checkIn,
  checkOut,
  fetchTodayAttendance,
  getTodayStatusLabel,
} from "@/services/attendance";
import type { AttendanceRecord } from "@/types/attendance";

export function useTodayAttendance(employeeId: string | undefined) {
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!employeeId) {
      setRecord(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const todayRecord = await fetchTodayAttendance(employeeId);
      setRecord(todayRecord);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load attendance.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCheckIn = useCallback(async () => {
    if (!employeeId) {
      return;
    }

    setIsCheckingIn(true);
    setError(null);

    try {
      const updated = await checkIn(employeeId);
      setRecord(updated);
    } catch (checkInError) {
      setError(
        checkInError instanceof Error
          ? checkInError.message
          : "Check-in failed.",
      );
    } finally {
      setIsCheckingIn(false);
    }
  }, [employeeId]);

  const handleCheckOut = useCallback(async () => {
    if (!employeeId) {
      return;
    }

    setIsCheckingOut(true);
    setError(null);

    try {
      const updated = await checkOut(employeeId);
      setRecord(updated);
    } catch (checkOutError) {
      setError(
        checkOutError instanceof Error
          ? checkOutError.message
          : "Check-out failed.",
      );
    } finally {
      setIsCheckingOut(false);
    }
  }, [employeeId]);

  const statusLabel = getTodayStatusLabel(record);
  const canCheckIn = !record?.check_in_time;
  const canCheckOut = Boolean(record?.check_in_time && !record?.check_out_time);

  return {
    record,
    statusLabel,
    isLoading,
    isCheckingIn,
    isCheckingOut,
    canCheckIn,
    canCheckOut,
    error,
    refresh,
    handleCheckIn,
    handleCheckOut,
  };
}
