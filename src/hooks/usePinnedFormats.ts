import { useCallback } from "react";

import { PINNED_FORMATS_KEY } from "../constants";
import useLocalStorage from "./useLocalStorage";

export interface PinnedFormat {
  id: string; // unique: `${Date.now()}-${Math.random().toString(36).slice(2)}`
  name: string; // user-chosen label
  exponentWidth: number;
  significandWidth: number;
  urlPath: string; // `/custom-pinned-${id}`
  pageTitle: string; // `${name} Converter`
}

export const usePinnedFormats = (): {
  pinnedFormats: PinnedFormat[];
  pinFormat: (name: string, exp: number, sig: number) => void;
  unpinFormat: (id: string) => void;
} => {
  const [pinnedFormats, setPinnedFormats] = useLocalStorage<PinnedFormat[]>(
    PINNED_FORMATS_KEY,
    []
  );

  const pinFormat = useCallback(
    (name: string, exp: number, sig: number) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setPinnedFormats([
        ...pinnedFormats,
        {
          id,
          name,
          exponentWidth: exp,
          significandWidth: sig,
          urlPath: `/custom-pinned-${id}`,
          pageTitle: `${name} Converter`,
        },
      ]);
    },
    [pinnedFormats, setPinnedFormats]
  );

  const unpinFormat = useCallback(
    (id: string) => setPinnedFormats(pinnedFormats.filter((p) => p.id !== id)),
    [pinnedFormats, setPinnedFormats]
  );

  return { pinnedFormats, pinFormat, unpinFormat };
};
