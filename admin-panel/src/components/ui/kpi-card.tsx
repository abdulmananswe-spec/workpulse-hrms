"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  gradient: string;
  className?: string;
};

export function KpiCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  gradient,
  className,
}: KpiCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {change !== undefined ? (
            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
              )}
              <span className={isPositive ? "text-emerald-600" : "text-rose-600"}>
                {isPositive ? "+" : ""}
                {change}%
              </span>
              {changeLabel ? (
                <span className="text-muted-foreground">{changeLabel}</span>
              ) : null}
            </div>
          ) : null}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
            gradient,
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-opacity group-hover:opacity-100" />
    </motion.div>
  );
}
