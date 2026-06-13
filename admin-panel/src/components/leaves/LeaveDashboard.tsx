"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/ui/kpi-card";
import { Label } from "@/components/ui/label";
import { TableScroll } from "@/components/ui/table-scroll";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  ClipboardList,
  XCircle,
} from "lucide-react";
import {
  approveLeaveAction,
  rejectLeaveAction,
} from "@/lib/leaves/actions";
import type { LeaveRequestRow, LeaveSummary } from "@/lib/leaves/queries";
import {
  calculateLeaveDays,
  LEAVE_TYPE_LABELS,
  type LeaveStatus,
} from "@/lib/leaves/utils";

type LeaveDashboardProps = {
  requests: LeaveRequestRow[];
  summary: LeaveSummary;
  initialTab: LeaveStatus;
  initialSearch: string;
};

const tabs: { id: LeaveStatus; label: string }[] = [
  { id: "pending", label: "Leave Queue" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

function statusBadgeVariant(status: LeaveStatus) {
  switch (status) {
    case "approved":
      return "success" as const;
    case "rejected":
      return "danger" as const;
    case "cancelled":
      return "default" as const;
    default:
      return "warning" as const;
  }
}

export function LeaveDashboard({
  requests,
  summary,
  initialTab,
  initialSearch,
}: LeaveDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState<LeaveStatus>(initialTab);
  const [actionTarget, setActionTarget] = useState<LeaveRequestRow | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      if (request.status !== activeTab) {
        return false;
      }

      if (!query) {
        return true;
      }

      const employee = request.employee;
      return (
        (employee?.full_name.toLowerCase().includes(query) ?? false) ||
        (employee?.email.toLowerCase().includes(query) ?? false) ||
        (employee?.employee_code?.toLowerCase().includes(query) ?? false) ||
        request.reason?.toLowerCase().includes(query) ||
        request.leave_type.toLowerCase().includes(query)
      );
    });
  }, [requests, activeTab, search]);

  function updateUrl(tab: LeaveStatus, query: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);

    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }

    router.replace(`/dashboard/leaves?${params.toString()}`);
  }

  function handleTabChange(tab: LeaveStatus) {
    setActiveTab(tab);
    updateUrl(tab, search);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
  }

  function openAction(request: LeaveRequestRow, type: "approve" | "reject") {
    setActionTarget(request);
    setActionType(type);
    setRemarks("");
    setError(null);
  }

  function closeActionDialog() {
    setActionTarget(null);
    setActionType(null);
    setRemarks("");
    setError(null);
  }

  async function handleSubmitAction() {
    if (!actionTarget || !actionType) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (actionType === "approve") {
        await approveLeaveAction(actionTarget.id, remarks);
      } else {
        await rejectLeaveAction(actionTarget.id, remarks);
      }

      closeActionDialog();
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to process leave request.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Pending Requests" value={summary.pending} icon={ClipboardList} gradient="from-amber-500 to-orange-600" />
        <KpiCard label="Approved Leaves" value={summary.approved} icon={CheckCircle2} gradient="from-emerald-500 to-teal-600" />
        <KpiCard label="Rejected Leaves" value={summary.rejected} icon={XCircle} gradient="from-rose-500 to-red-600" />
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {tab.id === "pending"
                  ? summary.pending
                  : tab.id === "approved"
                    ? summary.approved
                    : summary.rejected}
              </span>
            </Button>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="leave-search">Search</Label>
          <Input
            id="leave-search"
            placeholder="Search by employee, code, type, or reason"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
          />
        </div>
      </div>

      <TableScroll className="rounded-2xl border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                {activeTab === "pending" ? (
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                ) : (
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Admin Remarks
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === "pending" ? 7 : 7}
                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                  >
                    No {activeTab} leave requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={request.employee?.full_name}
                          imageUrl={request.employee?.avatar_url}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-slate-900">
                            {request.employee?.full_name ?? "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {request.employee?.employee_code ?? request.employee?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {LEAVE_TYPE_LABELS[request.leave_type]}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {request.start_date}
                      {request.start_date !== request.end_date
                        ? ` to ${request.end_date}`
                        : ""}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {calculateLeaveDays(request.start_date, request.end_date)}
                    </td>
                    <td className="max-w-xs px-6 py-4 text-sm text-slate-600">
                      {request.reason ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusBadgeVariant(request.status)}>
                        {request.status}
                      </Badge>
                    </td>
                    {activeTab === "pending" ? (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => openAction(request, "approve")}
                          >
                            Approve
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openAction(request, "reject")}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    ) : (
                      <td className="max-w-xs px-6 py-4 text-sm text-slate-600">
                        {request.admin_remarks ?? "—"}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </TableScroll>

      <Dialog
        open={Boolean(actionTarget && actionType)}
        title={
          actionType === "approve"
            ? "Approve Leave Request"
            : "Reject Leave Request"
        }
        description={
          actionTarget
            ? `${actionTarget.employee?.full_name ?? "Employee"} · ${LEAVE_TYPE_LABELS[actionTarget.leave_type]} · ${actionTarget.start_date} to ${actionTarget.end_date}`
            : undefined
        }
        onClose={closeActionDialog}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="remarks">
              Admin Remarks
              {actionType === "reject" ? " (required)" : " (optional)"}
            </Label>
            <Textarea
              id="remarks"
              placeholder={
                actionType === "reject"
                  ? "Explain why this leave request is rejected"
                  : "Optional note for the employee"
              }
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              rows={4}
            />
          </div>

          {error ? (
            <p className="text-sm text-rose-600">{error}</p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeActionDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={actionType === "reject" ? "destructive" : "default"}
              disabled={
                isSubmitting || (actionType === "reject" && !remarks.trim())
              }
              onClick={() => void handleSubmitAction()}
            >
              {isSubmitting
                ? "Processing..."
                : actionType === "approve"
                  ? "Approve Leave"
                  : "Reject Leave"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
