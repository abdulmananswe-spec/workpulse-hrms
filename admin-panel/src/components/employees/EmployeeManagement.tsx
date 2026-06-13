"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { EmployeeAvatarUpload } from "@/components/employees/EmployeeAvatarUpload";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { TableScroll } from "@/components/ui/table-scroll";
import {
  createEmployeeAction,
  deleteEmployeeAction,
  resetEmployeePasswordAction,
  setEmployeeActiveAction,
  updateEmployeeAction,
  type EmployeeFormInput,
} from "@/lib/employees/actions";
import {
  removeEmployeeAvatarAction,
  uploadEmployeeAvatarAction,
} from "@/lib/employees/avatar-actions";
import type { BranchSummary, EmployeeRow } from "@/lib/employees/queries";
import { toast } from "sonner";

type EmployeeManagementProps = {
  employees: EmployeeRow[];
  branches: BranchSummary[];
  initialSearch: string;
};

type CredentialsState = {
  title: string;
  email: string;
  temporaryPassword: string;
};

const emptyForm: EmployeeFormInput = {
  full_name: "",
  email: "",
  phone: "",
  employee_code: "",
  designation: "",
  branch_id: null,
  is_active: true,
};

export function EmployeeManagement({
  employees,
  branches,
  initialSearch,
}: EmployeeManagementProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRow | null>(
    null,
  );
  const [form, setForm] = useState<EmployeeFormInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<CredentialsState | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  function resetPhotoState(avatarUrl: string | null = null) {
    setPhotoPreview(avatarUrl);
    setPendingPhotoFile(null);
    setRemovePhoto(false);
    setPhotoUploading(false);
    setUploadProgress(0);
  }

  function handlePhotoSelect(file: File) {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, and WEBP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }
    setPendingPhotoFile(file);
    setRemovePhoto(false);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handlePhotoRemove() {
    setPendingPhotoFile(null);
    setRemovePhoto(true);
    setPhotoPreview(null);
  }

  async function syncEmployeePhoto(employeeId: string) {
    if (pendingPhotoFile) {
      setPhotoUploading(true);
      setUploadProgress(20);
      const formData = new FormData();
      formData.set("avatar", pendingPhotoFile);
      setUploadProgress(55);
      await uploadEmployeeAvatarAction(employeeId, formData);
      setUploadProgress(100);
      setPhotoUploading(false);
      return;
    }

    if (removePhoto) {
      setPhotoUploading(true);
      setUploadProgress(30);
      await removeEmployeeAvatarAction(employeeId);
      setUploadProgress(100);
      setPhotoUploading(false);
    }
  }

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return employees;
    }

    return employees.filter((employee) => {
      return (
        employee.full_name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        (employee.employee_code?.toLowerCase().includes(query) ?? false) ||
        (employee.designation?.toLowerCase().includes(query) ?? false) ||
        (employee.branch?.name.toLowerCase().includes(query) ?? false)
      );
    });
  }, [employees, search]);

  function handleSearchChange(value: string) {
    setSearch(value);
  }

  function openCreateForm() {
    setEditingEmployee(null);
    setForm(emptyForm);
    setError(null);
    resetPhotoState(null);
    setFormOpen(true);
  }

  function openEditForm(employee: EmployeeRow) {
    setEditingEmployee(employee);
    setForm({
      full_name: employee.full_name,
      email: employee.email,
      phone: employee.phone ?? "",
      employee_code: employee.employee_code ?? "",
      designation: employee.designation ?? "",
      branch_id: employee.branch_id,
      is_active: employee.is_active,
    });
    setError(null);
    resetPhotoState(employee.avatar_url);
    setFormOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (editingEmployee) {
        await updateEmployeeAction(editingEmployee.id, form);
        await syncEmployeePhoto(editingEmployee.id);
        setFormOpen(false);
        resetPhotoState(null);
        toast.success(`${form.full_name} has been updated.`);
        router.refresh();
      } else {
        const result = await createEmployeeAction(form);
        await syncEmployeePhoto(result.employeeId);
        setFormOpen(false);
        resetPhotoState(null);
        setCredentials({
          title: "Employee Created",
          email: result.email,
          temporaryPassword: result.temporaryPassword,
        });
        router.refresh();
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save employee.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(employee: EmployeeRow) {
    if (
      employee.is_active &&
      !window.confirm(`Deactivate ${employee.full_name}? They will lose mobile app access.`)
    ) {
      return;
    }

    setActionLoadingId(employee.id);

    try {
      await setEmployeeActiveAction(employee.id, !employee.is_active);
      toast.success(
        employee.is_active
          ? `${employee.full_name} has been deactivated.`
          : `${employee.full_name} has been activated.`,
      );
      router.refresh();
    } catch (toggleError) {
      const message =
        toggleError instanceof Error
          ? toggleError.message
          : "Unable to update employee status.";
      setError(message);
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDelete(employee: EmployeeRow) {
    if (
      !window.confirm(
        `Permanently delete ${employee.full_name}? This removes their account and cannot be undone.`,
      )
    ) {
      return;
    }

    setActionLoadingId(employee.id);

    try {
      await deleteEmployeeAction(employee.id);
      toast.success(`${employee.full_name} has been deleted.`);
      router.refresh();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Unable to delete employee.";
      setError(message);
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleResetPassword(employee: EmployeeRow) {
    setActionLoadingId(employee.id);

    try {
      const result = await resetEmployeePasswordAction(employee.id);
      setCredentials({
        title: "Password Reset",
        email: employee.email,
        temporaryPassword: result.temporaryPassword,
      });
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Unable to reset password.",
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Label htmlFor="employee-search">Search employees</Label>
          <Input
            id="employee-search"
            placeholder="Search by name, email, code, branch..."
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="max-w-md"
          />
        </div>
        <Button onClick={openCreateForm}>Add Employee</Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredEmployees.slice(0, 6).map((employee) => (
          <Link
            key={employee.id}
            href={`/dashboard/employees/${employee.id}`}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <UserAvatar
                name={employee.full_name}
                imageUrl={employee.avatar_url}
                size="lg"
              />
              <div>
                <p className="font-semibold text-foreground">{employee.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {employee.designation ?? "Team Member"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{employee.branch?.name ?? "No branch"}</span>
              <Badge variant={employee.is_active ? "success" : "danger"}>
                {employee.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </Link>
        ))}
      </div>

      <TableScroll className="rounded-2xl border border-border bg-card">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Employee
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Code
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Designation
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Branch
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No employees found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={employee.full_name}
                          imageUrl={employee.avatar_url}
                          size="md"
                        />
                        <div>
                          <Link
                            href={`/dashboard/employees/${employee.id}`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {employee.full_name}
                          </Link>
                          <div className="text-muted-foreground">{employee.email}</div>
                          {employee.phone ? (
                            <div className="text-xs text-muted-foreground">
                              {employee.phone}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{employee.employee_code ?? "—"}</td>
                    <td className="px-4 py-4">{employee.designation ?? "—"}</td>
                    <td className="px-4 py-4">{employee.branch?.name ?? "—"}</td>
                    <td className="px-4 py-4">
                      <Badge variant={employee.is_active ? "success" : "danger"}>
                        {employee.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditForm(employee)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoadingId === employee.id}
                          onClick={() => void handleResetPassword(employee)}
                        >
                          Reset Password
                        </Button>
                        <Button
                          variant={employee.is_active ? "destructive" : "secondary"}
                          size="sm"
                          disabled={actionLoadingId === employee.id}
                          onClick={() => void handleToggleActive(employee)}
                        >
                          {employee.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoadingId === employee.id}
                          onClick={() => void handleDelete(employee)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </TableScroll>

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingEmployee ? "Edit Employee" : "Add Employee"}
        description={
          editingEmployee
            ? "Update employee profile details and branch assignment."
            : "Create a new employee account with a temporary password."
        }
      >
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <EmployeeAvatarUpload
            fullName={form.full_name || "Employee"}
            previewUrl={photoPreview}
            disabled={isSubmitting}
            uploading={photoUploading}
            uploadProgress={uploadProgress}
            onFileSelect={handlePhotoSelect}
            onRemove={handlePhotoRemove}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    full_name: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee_code">Employee Code</Label>
              <Input
                id="employee_code"
                value={form.employee_code ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    employee_code: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={form.designation ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    designation: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="branch_id">Branch</Label>
              <Select
                id="branch_id"
                value={form.branch_id ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    branch_id: event.target.value || null,
                  }))
                }
              >
                <option value="">Select branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                    {!branch.is_active ? " (Inactive)" : ""}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={form.is_active ?? true}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  is_active: event.target.checked,
                }))
              }
            />
            <Label htmlFor="is_active">Active employee</Label>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || photoUploading}>
              {isSubmitting || photoUploading
                ? "Saving..."
                : editingEmployee
                  ? "Save Changes"
                  : "Create Employee"}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={Boolean(credentials)}
        onClose={() => setCredentials(null)}
        title={credentials?.title ?? "Credentials"}
        description="Share these credentials securely with the employee."
      >
        {credentials ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-slate-900">{credentials.email}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Temporary Password
              </p>
              <p className="font-mono text-lg font-semibold text-slate-900">
                {credentials.temporaryPassword}
              </p>
            </div>
            <Button className="w-full" onClick={() => setCredentials(null)}>
              Done
            </Button>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
