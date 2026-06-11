"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { UNAUTHORIZED_MESSAGE } from "@/lib/auth/roles";
import { isValidEmail } from "@/lib/validation";

function mapAuthError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === UNAUTHORIZED_MESSAGE) {
      return UNAUTHORIZED_MESSAGE;
    }

    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return "Invalid email or password.";
    }

    return error.message;
  }

  return "Unable to sign in. Please try again.";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, authError, clearAuthError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "unauthorized") {
      setError(UNAUTHORIZED_MESSAGE);
    } else if (errorParam === "config") {
      setError("Application configuration is incomplete. Contact your administrator.");
    }
    if (searchParams.get("signedOut") === "1") {
      setError(null);
    }
  }, [searchParams]);

  const displayError = error ?? authError;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearAuthError();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn(email, password);
      const redirectTo = searchParams.get("redirectTo");
      const destination =
        redirectTo?.startsWith("/dashboard") ? redirectTo : "/dashboard";
      router.replace(destination);
      router.refresh();
    } catch (submitError) {
      setError(mapAuthError(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-slate-200 shadow-xl">
      <CardHeader className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Admin Portal
        </p>
        <CardTitle>Sign in to dashboard</CardTitle>
        <CardDescription>
          Use your administrator credentials to access the control panel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          {displayError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {displayError}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/forgot-password" className="font-medium text-slate-900 hover:underline">
              Forgot password?
            </Link>
          </p>
        </form>

        <footer className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p>© 2026 WorkPulse HRMS</p>
          <p className="mt-1">Developed by Abdul Manan</p>
          <p>All Rights Reserved.</p>
        </footer>
      </CardContent>
    </Card>
  );
}
