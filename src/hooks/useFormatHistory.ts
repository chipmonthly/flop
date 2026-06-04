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
  error?: string; // stringified error representation
  sign?: string; // sign bit string
  exponent?: string; // exponent bit string
  mantissa?: string; // mantissa bit string
}

export const useFormatHistory = (
  formatName: string
): {
  history: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
  clearHistory: () => void;
  deleteEntry: (id: string) => void;
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

  const deleteEntry = useCallback(
    (id: string) => {
      setHistory(history.filter((entry) => entry.id !== id));
    },
    [history, setHistory]
  );

  return { history, addEntry, clearHistory, deleteEntry };
};
