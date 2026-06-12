"use client";

import { Camera, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { removeAvatarAction, uploadAvatarAction } from "@/lib/profile/actions";
import type { Profile } from "@/types/database";

const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";

type ProfileAvatarUploadProps = {
  profile: Profile;
};

export function ProfileAvatarUpload({ profile }: ProfileAvatarUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, and WEBP images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const formData = new FormData();
      formData.set("avatar", file);
      const { avatarUrl } = await uploadAvatarAction(formData);
      setPreviewUrl(avatarUrl);
      toast.success("Profile photo updated");
      router.refresh();
    } catch (error) {
      setPreviewUrl(profile.avatar_url);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localPreview);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      await removeAvatarAction();
      setPreviewUrl(null);
      toast.success("Profile photo removed");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove photo");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative">
        <UserAvatar name={profile.full_name} imageUrl={previewUrl} size="xl" showStatus />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:opacity-60"
          aria-label="Upload profile photo"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(event) => void handleFileChange(event)}
        />
      </div>

      <div className="space-y-3 text-center sm:text-left">
        <div>
          <p className="font-semibold text-foreground">{profile.full_name}</p>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Active · Administrator
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          JPG, JPEG, PNG, or WEBP. Max 5 MB.
        </p>
        {previewUrl ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={removing || uploading}
            onClick={() => void handleRemove()}
          >
            {removing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Remove photo
          </Button>
        ) : null}
      </div>
    </div>
  );
}
