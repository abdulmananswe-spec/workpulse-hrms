"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type DropdownContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
};

const DropdownContext = createContext<DropdownContextValue | null>(null);

type DropdownMenuProps = {
  children: ReactNode;
  align?: "start" | "end";
  onOpenChange?: (open: boolean) => void;
};

export function DropdownMenu({ children, onOpenChange }: DropdownMenuProps) {
  const [open, setOpenState] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenState(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  className,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  const context = useContext(DropdownContext);
  if (!context) throw new Error("DropdownMenuTrigger must be inside DropdownMenu");

  return (
    <button
      ref={context.triggerRef}
      type="button"
      aria-label={ariaLabel}
      aria-expanded={context.open}
      aria-haspopup="menu"
      className={className}
      onClick={() => context.setOpen(!context.open)}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  children,
  className,
  align = "end",
}: {
  children: ReactNode;
  className?: string;
  align?: "start" | "end";
}) {
  const context = useContext(DropdownContext);
  const contentRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => context?.setOpen(false), [context]);

  useEffect(() => {
    if (!context?.open) return;

    function handlePointer(event: MouseEvent) {
      const target = event.target as Node;
      if (
        contentRef.current?.contains(target) ||
        context?.triggerRef.current?.contains(target)
      ) {
        return;
      }
      close();
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [context, close]);

  if (!context?.open) return null;

  return (
    <div
      ref={contentRef}
      role="menu"
      className={cn(
        "absolute z-50 mt-2 max-h-[min(80vh,32rem)] w-80 overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-xl",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  className,
  onSelect,
  disabled,
}: {
  children: ReactNode;
  className?: string;
  onSelect?: () => void;
  disabled?: boolean;
}) {
  const context = useContext(DropdownContext);

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground transition hover:bg-accent disabled:opacity-50",
        className,
      )}
      onClick={() => {
        onSelect?.();
        context?.setOpen(false);
      }}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-border" role="separator" />;
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground", className)}>
      {children}
    </p>
  );
}
