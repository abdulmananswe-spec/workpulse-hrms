import { DutyHoursForm } from "@/components/settings/DutyHoursForm";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchOrgSettings } from "@/lib/settings/queries";

export default async function SettingsPage() {
  const settings = await fetchOrgSettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure duty hours and workspace preferences. Duty hours sync to the mobile app.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Duty Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <DutyHoursForm settings={settings} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Theme</p>
            <p className="text-sm text-muted-foreground">Switch between light and dark mode.</p>
          </div>
          <ThemeToggle />
        </CardContent>
      </Card>

      <footer className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <p>© 2026 WorkPulse HRMS</p>
        <p className="mt-1">Developed by Abdul Manan</p>
        <p>All Rights Reserved.</p>
      </footer>
    </div>
  );
}
