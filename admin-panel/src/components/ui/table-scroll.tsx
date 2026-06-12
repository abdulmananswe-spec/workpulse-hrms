import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type TableScrollProps = {
  children: ReactNode;
  className?: string;
};

export function TableScroll({ children, className }: TableScrollProps) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-2xl", className)}>
      <div className="min-w-[640px]">{children}</div>
    </div>
  );
}
