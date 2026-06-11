"use client";

import {
  buildAttendanceCsv,
  buildLeaveCsv,
  buildWorkforceCsv,
} from "@/lib/reports/actions";

function saveCsvFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadWorkforceReport() {
  const result = await buildWorkforceCsv();
  saveCsvFile(result.filename, result.content);
}

export async function downloadAttendanceReport(start: string, end: string) {
  const result = await buildAttendanceCsv(start, end);
  saveCsvFile(result.filename, result.content);
}

export async function downloadLeaveReport(start: string, end: string) {
  const result = await buildLeaveCsv(start, end);
  saveCsvFile(result.filename, result.content);
}
