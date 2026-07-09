"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ProfileAvatarUpload } from "@/components/profile/ProfileAvatarUpload";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCompanySettingsAction } from "@/lib/settings/actions";
import type { OrgSettings } from "@/lib/settings/queries";
import type { Profile } from "@/types/database";

type SettingsPanelProps = {
  settings: OrgSettings;
  profile: Profile;
};

export function SettingsPanel({ settings, profile }: SettingsPanelProps) {
  const [companyName, setCompanyName] = useState(settings.company_name ?? "WorkPulse HRMS");
  const [timezone, setTimezone] = useState(settings.timezone ?? "Asia/Karachi");
  const [geofence, setGeofence] = useState(String(settings.default_geofence_radius ?? 150));
  const [emailNotifications, setEmailNotifications] = useState(
    settings.email_notifications_enabled ?? true,
  );
  const [saving, setSaving] = useState(false);

  async function saveCompanySettings() {
    setSaving(true);
    try {
      await updateCompanySettingsAction({
        company_name: companyName,
        timezone,
        default_geofence_radius: Number(geofence),
        email_notifications_enabled: emailNotifications,
      });
      toast.success("Company settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle>My Account</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/profile">
              <User className="h-4 w-4" />
              View full profile
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ProfileAvatarUpload profile={profile} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="geofence">Default Geofence Radius (m)</Label>
            <Input
              id="geofence"
              type="number"
              min={10}
              max={5000}
              value={geofence}
              onChange={(e) => setGeofence(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />
            <span className="text-sm">Enable email notifications</span>
          </label>
          <Button
            type="button"
            disabled={saving}
            onClick={() => void saveCompanySettings()}
            className="sm:col-span-2 sm:w-fit"
          >
            {saving ? "Saving..." : "Save Company Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-foreground">Theme</p>
            <p className="text-sm text-muted-foreground">Light, dark, or system preference.</p>
          </div>
          <ThemeToggle />
        </CardContent>
      </Card>
    </div>
  );
}
