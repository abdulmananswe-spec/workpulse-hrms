"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDutyHoursAction } from "@/lib/settings/actions";
import type { OrgSettings } from "@/lib/settings/queries";

function toTimeInput(value: string): string {
  return value.slice(0, 5);
}

type DutyHoursFormProps = {
  settings: OrgSettings;
};

export function DutyHoursForm({ settings }: DutyHoursFormProps) {
  const router = useRouter();
  const [dutyStart, setDutyStart] = useState(toTimeInput(settings.duty_start_time));
  const [dutyEnd, setDutyEnd] = useState(toTimeInput(settings.duty_end_time));
  const [graceMinutes, setGraceMinutes] = useState(String(settings.late_grace_minutes));
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      await updateDutyHoursAction({
        duty_start_time: dutyStart,
        duty_end_time: dutyEnd,
        late_grace_minutes: Number(graceMinutes),
      });
      toast.success("Duty hours updated. Changes apply on mobile immediately.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save duty hours.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="duty_start">Duty Start</Label>
          <Input
            id="duty_start"
            type="time"
            value={dutyStart}
            onChange={(event) => setDutyStart(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duty_end">Duty End</Label>
          <Input
            id="duty_end"
            type="time"
            value={dutyEnd}
            onChange={(event) => setDutyEnd(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="late_grace">Late Grace (minutes)</Label>
          <Input
            id="late_grace"
            type="number"
            min={0}
            max={120}
            value={graceMinutes}
            onChange={(event) => setGraceMinutes(event.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Check-ins after start time + grace period are marked late on the mobile app.
          </p>
        </div>
      </div>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Duty Hours"}
      </Button>
    </form>
  );
}
