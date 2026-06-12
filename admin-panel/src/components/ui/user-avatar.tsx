"use client";

import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
} as const;

type UserAvatarProps = {
  name?: string | null;
  imageUrl?: string | null;
  size?: keyof typeof sizeClasses;
  showStatus?: boolean;
  className?: string;
};

function getInitials(name?: string | null) {
  const parts = (name ?? "Admin").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export function UserAvatar({
  name,
  imageUrl,
  size = "md",
  showStatus = false,
  className,
}: UserAvatarProps) {
  const initials = getInitials(name);

  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-violet-600 font-semibold text-white ring-2 ring-background",
          sizeClasses[size],
        )}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name ?? "Profile"} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </div>
      {showStatus ? (
        <span
          className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500"
          aria-label="Active"
          title="Active"
        />
      ) : null}
    </div>
  );
}
