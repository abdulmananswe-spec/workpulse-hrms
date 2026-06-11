import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1">
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_50%)]" />
        <div className="relative">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-sm font-bold text-white backdrop-blur">
            WP
          </div>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-blue-200/80">
            WorkPulse HRMS
          </p>
          <h1 className="mt-4 max-w-md text-4xl font-bold tracking-tight text-white">
            Enterprise workforce management for modern teams.
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-300">
            Secure admin access to attendance analytics, employee directory, leave
            approvals, and branch operations.
          </p>
        </div>
        <p className="relative text-sm text-slate-400">
          © 2026 WorkPulse HRMS · Developed by Abdul Manan
        </p>
      </div>

      <div className="flex w-full flex-1 items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        {children}
      </div>
    </div>
  );
}
