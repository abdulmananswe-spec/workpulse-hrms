"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  createAnnouncementAction,
  deleteAnnouncementAction,
  republishAnnouncementAction,
  setAnnouncementActiveAction,
  updateAnnouncementAction,
  type AnnouncementFormInput,
} from "@/lib/announcements/actions";
import type { AnnouncementRow } from "@/lib/announcements/queries";

type AnnouncementManagementProps = {
  announcements: AnnouncementRow[];
};

const emptyForm: AnnouncementFormInput = {
  title: "",
  body: "",
  priority: "medium",
  notifyEmployees: true,
};

const priorityVariant = {
  high: "danger" as const,
  medium: "warning" as const,
  low: "default" as const,
};

export function AnnouncementManagement({ announcements }: AnnouncementManagementProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AnnouncementRow | null>(null);
  const [form, setForm] = useState<AnnouncementFormInput>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(item: AnnouncementRow) {
    setEditing(item);
    setForm({
      title: item.title,
      body: item.body,
      priority: item.priority,
      notifyEmployees: false,
    });
    setFormOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (editing) {
        await updateAnnouncementAction(editing.id, form);
        toast.success("Announcement updated.");
      } else {
        await createAnnouncementAction(form);
        toast.success("Announcement published and sent to employees.");
      }
      setFormOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save announcement.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(item: AnnouncementRow) {
    setLoadingId(item.id);
    try {
      await setAnnouncementActiveAction(item.id, !item.is_active);
      toast.success(item.is_active ? "Announcement archived." : "Announcement activated.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update announcement.");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(item: AnnouncementRow) {
    if (!window.confirm(`Delete announcement "${item.title}"?`)) return;
    setLoadingId(item.id);
    try {
      await deleteAnnouncementAction(item.id);
      toast.success("Announcement deleted.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete announcement.");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleRepublish(item: AnnouncementRow) {
    setLoadingId(item.id);
    try {
      await republishAnnouncementAction(item.id);
      toast.success("Announcement sent to all employees again.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to republish.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreate}>New Announcement</Button>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <p className="text-lg font-semibold text-foreground">No announcements yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first announcement to notify all employees on the mobile app.
          </p>
          <Button className="mt-6" onClick={openCreate}>
            Create Announcement
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <Badge variant={priorityVariant[item.priority]}>{item.priority}</Badge>
                    <Badge variant={item.is_active ? "success" : "default"}>
                      {item.is_active ? "Published" : "Archived"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {new Date(item.published_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loadingId === item.id}
                    onClick={() => void handleRepublish(item)}
                  >
                    Notify Again
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loadingId === item.id}
                    onClick={() => void handleToggleActive(item)}
                  >
                    {item.is_active ? "Archive" : "Activate"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={loadingId === item.id}
                    onClick={() => void handleDelete(item)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm text-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Announcement" : "New Announcement"}
        description="Publish a company-wide announcement to the employee mobile app."
        className="max-w-2xl"
      >
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) => setForm((c) => ({ ...c, title: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              id="priority"
              value={form.priority}
              onChange={(event) =>
                setForm((c) => ({
                  ...c,
                  priority: event.target.value as AnnouncementFormInput["priority"],
                }))
              }
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              rows={6}
              value={form.body}
              onChange={(event) => setForm((c) => ({ ...c, body: event.target.value }))}
              required
            />
          </div>
          {!editing ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.notifyEmployees ?? true}
                onChange={(event) =>
                  setForm((c) => ({ ...c, notifyEmployees: event.target.checked }))
                }
              />
              Send push notification to all active employees
            </label>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editing ? "Save Changes" : "Publish Announcement"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
