"use client";

import { LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { redirectToLogin } from "@/lib/auth/logout";

type LogoutButtonProps = {
  variant?: "default" | "ghost" | "outline";
  showIcon?: boolean;
  iconOnly?: boolean;
  className?: string;
};

export function LogoutButton({
  variant = "ghost",
  showIcon = true,
  iconOnly = false,
  className,
}: LogoutButtonProps) {
  const queryClient = useQueryClient();
  const { signOut } = useAuth();

  function handleLogout() {
    void (async () => {
      try {
        queryClient.clear();
        await signOut();
        toast.success("Successfully signed out");
        redirectToLogin({ signedOut: true });
      } catch {
        toast.error("Sign out failed. Please try again.");
      }
    })();
  }

  return (
    <Button variant={variant} className={className} onClick={handleLogout} aria-label="Sign out">
      {showIcon ? <LogOut className="h-4 w-4" /> : null}
      {iconOnly ? null : "Sign out"}
    </Button>
  );
}
