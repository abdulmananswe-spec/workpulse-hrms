import Link from "next/link";
import { KeyRound, Settings } from "lucide-react";

import { ProfileAvatarUpload } from "@/components/profile/ProfileAvatarUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedAdminProfile } from "@/lib/auth/server";

export default async function ProfilePage() {
  const { profile } = await getAuthenticatedAdminProfile();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">My Profile</h2>
        <p className="text-sm text-muted-foreground">
          Manage your administrator profile and account preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileAvatarUpload profile={profile} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Full name
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">{profile.full_name}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">{profile.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Role
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">Administrator</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Active
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/dashboard/settings">
            <Settings className="h-4 w-4" />
            Account Settings
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/reset-password">
            <KeyRound className="h-4 w-4" />
            Change Password
          </Link>
        </Button>
      </div>
    </div>
  );
}
