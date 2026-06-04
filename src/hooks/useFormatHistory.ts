import { useCallback } from "react";

import { HISTORY_STORAGE_KEY, MAX_HISTORY_ENTRIES } from "../constants";
import useLocalStorage from "./useLocalStorage";

export interface HistoryEntry {
  id: string;
  timestamp: number; // Date.now()
  decimalInput: string; // raw user string, e.g. "3.14"
  storedValue: string; // stringified back-converted result
  binaryRep: string; // full bit string
  hexRep: string; // hex string (without "0x" prefix)
}

export const useFormatHistory = (
  formatName: string
): {
  history: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
  clearHistory: () => void;
} => {
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(
    `${formatName}${HISTORY_STORAGE_KEY}`,
    []
  );

  const addEntry = useCallback(
    (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
      const newEntry: HistoryEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: Date.now(),
      };
      setHistory([newEntry, ...history].slice(0, MAX_HISTORY_ENTRIES));
    },
    [history, setHistory]
  );

  const clearHistory = useCallback(() => setHistory([]), [setHistory]);

  return { history, addEntry, clearHistory };
};
