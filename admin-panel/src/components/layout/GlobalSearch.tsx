"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Loader2, Search } from "lucide-react";

import { globalSearchAction, type SearchResult } from "@/lib/search/actions";
import { cn } from "@/lib/utils";

const RECENT_KEY = "workpulse-recent-searches";

type GlobalSearchProps = {
  className?: string;
};

export function GlobalSearch({ className }: GlobalSearchProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<SearchResult[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecent(JSON.parse(stored) as SearchResult[]);
    } catch {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const runSearch = useCallback(async (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await globalSearchAction(value);
      setResults(data);
    } finally {
      setLoading(false);
    }
  }, []);

  function selectResult(result: SearchResult) {
    const next = [result, ...recent.filter((r) => r.id !== result.id)].slice(0, 5);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    setOpen(false);
    setQuery("");
    router.push(result.href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-9 w-full max-w-xs items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground transition hover:text-foreground sm:max-w-sm lg:max-w-xs xl:max-w-md",
          className,
        )}
        aria-label="Open global search"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">Search…</span>
        <kbd className="ml-auto hidden rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline">
          ⌘K
        </kbd>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-background/80 p-4 pt-[12vh] backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close search"
            className="absolute inset-0"
            onClick={() => setOpen(false)}
          />
          <Command
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            shouldFilter={false}
          >
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Command.Input
                value={query}
                onValueChange={(value) => void runSearch(value)}
                placeholder="Search employees, branches, leaves…"
                className="h-12 flex-1 bg-transparent text-sm outline-none"
                autoFocus
              />
              {loading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
            </div>
            <Command.List className="max-h-80 overflow-y-auto p-2">
              {query.length < 2 && recent.length > 0 ? (
                <Command.Group heading="Recent">
                  {recent.map((item) => (
                    <Command.Item
                      key={item.id}
                      value={item.id}
                      onSelect={() => selectResult(item)}
                      className="cursor-pointer rounded-xl px-3 py-2 text-sm aria-selected:bg-accent"
                    >
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    </Command.Item>
                  ))}
                </Command.Group>
              ) : null}
              {results.length === 0 && query.length >= 2 && !loading ? (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">No results found.</p>
              ) : null}
              {results.map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.id}
                  onSelect={() => selectResult(item)}
                  className="cursor-pointer rounded-xl px-3 py-2 text-sm aria-selected:bg-accent"
                >
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {item.category} · {item.subtitle}
                  </p>
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </div>
      ) : null}
    </>
  );
}
