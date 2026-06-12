import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { getAuthenticatedAdminProfile } from "@/lib/auth/server";
import { fetchOrgSettings } from "@/lib/settings/queries";

export default async function SettingsPage() {
  const [settings, { profile }] = await Promise.all([
    fetchOrgSettings(),
    getAuthenticatedAdminProfile(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure company profile, duty hours, notifications, and workspace preferences.
        </p>
      </div>

      <SettingsPanel settings={settings} profile={profile} />

      <footer className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <p>© 2026 WorkPulse HRMS</p>
        <p className="mt-1">Developed by Abdul Manan</p>
        <p>All Rights Reserved.</p>
      </footer>
    </div>
  );
}
