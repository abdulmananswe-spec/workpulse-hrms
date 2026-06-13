"use client";

import { Camera, Loader2, Trash2 } from "lucide-react";
import { useRef } from "react";

import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";

const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";

type EmployeeAvatarUploadProps = {
  fullName: string;
  previewUrl: string | null;
  disabled?: boolean;
  uploading?: boolean;
  uploadProgress?: number;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
};

export function EmployeeAvatarUpload({
  fullName,
  previewUrl,
  disabled = false,
  uploading = false,
  uploadProgress = 0,
  onFileSelect,
  onRemove,
}: EmployeeAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    onFileSelect(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative">
          <UserAvatar name={fullName} imageUrl={previewUrl} size="xl" />
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:opacity-60"
            aria-label={previewUrl ? "Replace employee photo" : "Upload employee photo"}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            disabled={disabled || uploading}
            onChange={handleFileChange}
          />
        </div>

        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div>
            <p className="text-sm font-semibold text-foreground">Profile Photo</p>
            <p className="text-xs text-muted-foreground">
              Optional. JPG, JPEG, PNG, or WEBP. Max 5 MB. Managed by admin — employees cannot change this in the mobile app.
            </p>
          </div>

          {uploading ? (
            <div className="space-y-1">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.max(uploadProgress, 8)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Uploading photo… {uploadProgress}%</p>
            </div>
          ) : null}

          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
            >
              {previewUrl ? "Replace photo" : "Choose photo"}
            </Button>
            {previewUrl ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || uploading}
                onClick={onRemove}
              >
                <Trash2 className="h-4 w-4" />
                Remove photo
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
