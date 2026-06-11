import { AnnouncementManagement } from "@/components/announcements/AnnouncementManagement";
import { fetchAnnouncements } from "@/lib/announcements/queries";

export default async function AnnouncementsPage() {
  const announcements = await fetchAnnouncements();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Announcements</h2>
        <p className="text-sm text-muted-foreground">
          Publish company-wide announcements to the employee mobile app.
        </p>
      </div>
      <AnnouncementManagement announcements={announcements} />
    </div>
  );
}
