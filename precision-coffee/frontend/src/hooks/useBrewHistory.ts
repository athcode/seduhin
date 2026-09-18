import { useCallback, useEffect, useState } from "react";
import type { BrewHistoryEntry } from "../types";

const KEY = "precision-coffee:history";
const MAX = 30;

function load(): BrewHistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

function save(entries: BrewHistoryEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX)));
  } catch {
    /* storage penuh / diblokir — history opsional, jangan jatuhkan app */
  }
}

export function useBrewHistory() {
  const [history, setHistory] = useState<BrewHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(load());
  }, []);

  const addEntry = useCallback((entry: Omit<BrewHistoryEntry, "id" | "createdAt">) => {
    const full: BrewHistoryEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
    };
    setHistory((prev) => {
      const next = [full, ...prev].slice(0, MAX);
      save(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    save([]);
    setHistory([]);
  }, []);

  return { history, addEntry, clearHistory };
}
