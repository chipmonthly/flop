# PLAN.md — Feature Implementation Plan for `flop`

> Work through each phase **in order**. Run the verification checklist at the end of every
> phase before starting the next one. Never skip the CI checks.

---

## Background: Format Object Shape

Every predefined format in `src/constants.ts` is a plain object appended to `FORMATS[]`.
`App.tsx` and `FormatConverter.tsx` are driven entirely by those objects — no routing or
component changes are needed for new standard formats.

The **existing** shape is:
```ts
{
  name: string;          // displayed in the tab and as the converter title
  exponentWidth: number;
  significandWidth: number;
  urlPath: string;       // must be unique; becomes the React Router path
  pageTitle: string;     // written to document.title on navigation
}
```

---

## Phase 0 — Change Dev-Server Port to 8090

### Rationale
CRA's `react-scripts start` respects the `PORT` environment variable. The cleanest way to
bake this into the project (so every developer and CI gets it automatically) is to prefix
the `start` script in `package.json`.

### Files to change

| File | Change |
|---|---|
| `package.json` | Prepend `PORT=8090` to the `start` script |

### Exact diff

```diff
-    "start": "yarn run env react-scripts start",
+    "start": "PORT=8090 yarn run env react-scripts start",
```

> **Note for Windows contributors**: replace `PORT=8090` with
> `cross-env PORT=8090` if cross-platform support is ever required. Do not add
> `cross-env` as a dependency now — the project runs macOS/Linux in CI.

### Verification
- [ ] `yarn start` opens the dev server at `http://localhost:8090`
- [ ] `yarn test --watchAll=false` still passes (tests do not depend on the port)
- [ ] `yarn pretty-check .` and `yarn lint-check src` both pass

---

## Phase 1 — Add FP8_E5M2, FP8_E4M3, and FP4 Formats

### Background & Authoritative Specification

These formats come from the 2022 NVIDIA/Arm/Intel FP8 whitepaper and the OCP MX
(Microscaling) specification. They are **not** part of IEEE 754 proper.

| Format | Bits | Sign | Exponent | Mantissa | Infinity | NaN |
|---|---|---|---|---|---|---|
| **FP8_E5M2** | 8 | 1 | 5 | 2 | ✅ supported | ✅ multiple patterns |
| **FP8_E4M3** | 8 | 1 | 4 | 3 | ❌ not supported | ⚠️ single pattern only |
| **FP4 (E2M1)** | 4 | 1 | 2 | 1 | ❌ not supported | ❌ not supported |

Reference: [FP8 Formats for Deep Learning (arXiv 2209.05433)](https://arxiv.org/abs/2209.05433)
and [OCP MX Specification v1.0](https://www.opencompute.org/documents/ocp-microscaling-formats-mx-v1-0-spec-final-pdf).

### 1-A — Extend the format object shape

Because FP8_E4M3 and FP4 do not support infinity (and FP4 does not support NaN), the
format object needs two new **optional** boolean flags so the converter can suppress
those special values in the UI.

In `src/constants.ts`, define a `FormatDefinition` interface **before** the format constants:

```ts
// src/constants.ts — add near the top, before format definitions
export interface FormatDefinition {
  name: string;
  exponentWidth: number;
  significandWidth: number;
  urlPath: string;
  pageTitle: string;
  /** When false, ±Infinity bit patterns produce a "not supported" label in the UI.
   *  Defaults to true when absent. */
  supportsInfinity?: boolean;
  /** When false, NaN bit patterns produce a "not supported" label in the UI.
   *  Defaults to true when absent. */
  supportsNaN?: boolean;
  /** Short human-readable description (shown as tooltip / subtitle). */
  description?: string;
  /** Link to the authoritative specification document. */
  referenceUrl?: string;
}
```

Add explicit `FormatDefinition` types to all existing format constants:
```ts
export const FP32: FormatDefinition = { ... };
export const FP64: FormatDefinition = { ... };
export const FP16: FormatDefinition = { ... };
export const BF16: FormatDefinition = { ... };
export const TF32: FormatDefinition = { ... };
```

### 1-B — Add new format constants

Append **after** `TF32` and **before** the `FORMATS` array definition:

```ts
export const FP8_E5M2: FormatDefinition = {
  name: "FP8 E5M2",
  exponentWidth: 5,
  significandWidth: 2,
  urlPath: "/fp8-e5m2-converter",
  pageTitle: "FP8 E5M2 Converter",
  supportsInfinity: true,
  supportsNaN: true,
  description: "8-bit float, 5-bit exponent (NVIDIA/Arm/Intel spec 2022)",
  referenceUrl: "https://arxiv.org/abs/2209.05433",
};

export const FP8_E4M3: FormatDefinition = {
  name: "FP8 E4M3",
  exponentWidth: 4,
  significandWidth: 3,
  urlPath: "/fp8-e4m3-converter",
  pageTitle: "FP8 E4M3 Converter",
  supportsInfinity: false,  // E4M3 has no ±Inf encoding by spec
  supportsNaN: true,        // one NaN pattern: all-1s exponent + all-1s mantissa
  description: "8-bit float, 4-bit exponent (NVIDIA/Arm/Intel spec 2022)",
  referenceUrl: "https://arxiv.org/abs/2209.05433",
};

export const FP4_E2M1: FormatDefinition = {
  name: "FP4 E2M1",
  exponentWidth: 2,
  significandWidth: 1,
  urlPath: "/fp4-e2m1-converter",
  pageTitle: "FP4 E2M1 Converter",
  supportsInfinity: false,
  supportsNaN: false,
  description: "4-bit float, 2-bit exponent (OCP MX / MXFP4 spec)",
  referenceUrl:
    "https://www.opencompute.org/documents/ocp-microscaling-formats-mx-v1-0-spec-final-pdf",
};
```

Update `FORMATS` to a typed array and append the three new constants:
```ts
export const FORMATS: FormatDefinition[] = [FP32, FP64, FP16, BF16, TF32, FP8_E5M2, FP8_E4M3, FP4_E2M1];
```

### 1-C — Thread `supportsInfinity` / `supportsNaN` through the UI

#### `src/converter/FormatConverter.tsx`

1. Extend `FormatConverterProps` with the two optional flags:
   ```ts
   interface FormatConverterProps {
     name: string;
     exponentWidth: number;
     significandWidth: number;
     supportsInfinity?: boolean;
     supportsNaN?: boolean;
   }
   ```

2. Add a local helper (not exported) for guarded stringification:
   ```ts
   const safeStringifyFlop = (
     flop: Flop,
     scientific: boolean,
     supportsInfinity = true,
     supportsNaN = true
   ): string => {
     const raw = stringifyFlop(flop, scientific);
     if (!supportsInfinity && (raw === "infinity" || raw === "-infinity")) {
       return "[±Infinity not supported by this format]";
     }
     if (!supportsNaN && raw === "NaN") {
       return "[NaN not supported by this format]";
     }
     return raw;
   };
   ```

3. Replace the `stringifyFlop(storedFlop, scientificNotation)` call in the `Panel` JSX with:
   ```tsx
   stored={safeStringifyFlop(
     storedFlop,
     scientificNotation,
     props.supportsInfinity,
     props.supportsNaN
   )}
   ```

#### `src/App.tsx`

No changes needed — `<FormatConverter key={i} {...e} />` already spreads all format
properties, so `supportsInfinity` and `supportsNaN` are forwarded automatically.

### 1-D — New constants for special-value labels

Add to `src/constants.ts`:
```ts
export const INFINITY_NOT_SUPPORTED_STRING =
  "[±Infinity not supported by this format]";
export const NAN_NOT_SUPPORTED_STRING =
  "[NaN not supported by this format]";
```

Reference these in `safeStringifyFlop` instead of inline strings.

### 1-E — Tests

Create `src/converter/flop.formats.test.ts`:

```ts
import { FP4_E2M1, FP8_E4M3, FP8_E5M2 } from "../constants";
import {
  convertFlopToFlop754,
  Flop754Type,
  generateFlop,
} from "./flop";

describe("FP8 E5M2", () => {
  it("has total bit width of 8", () => {
    expect(1 + FP8_E5M2.exponentWidth + FP8_E5M2.significandWidth).toBe(8);
  });
  it("encodes a very large number as +Infinity", () => {
    const result = convertFlopToFlop754(
      generateFlop("1e40"),
      FP8_E5M2.exponentWidth,
      FP8_E5M2.significandWidth
    );
    expect(result.type).toBe(Flop754Type.POSITIVE_INFINITY);
  });
});

describe("FP8 E4M3", () => {
  it("has total bit width of 8", () => {
    expect(1 + FP8_E4M3.exponentWidth + FP8_E4M3.significandWidth).toBe(8);
  });
  it("supportsInfinity flag is false", () => {
    expect(FP8_E4M3.supportsInfinity).toBe(false);
  });
});

describe("FP4 E2M1", () => {
  it("has total bit width of 4", () => {
    expect(1 + FP4_E2M1.exponentWidth + FP4_E2M1.significandWidth).toBe(4);
  });
  it("supportsInfinity and supportsNaN flags are false", () => {
    expect(FP4_E2M1.supportsInfinity).toBe(false);
    expect(FP4_E2M1.supportsNaN).toBe(false);
  });
});
```

### Verification
- [ ] Three new tabs appear: `FP8 E5M2`, `FP8 E4M3`, `FP4 E2M1`
- [ ] FP8_E5M2: entering `1e40` shows `+Infinity` (supported)
- [ ] FP8_E4M3: entering `1e40` shows `[±Infinity not supported by this format]`
- [ ] FP4_E2M1: all-ones bit pattern shows `[NaN not supported by this format]`
- [ ] `yarn test --watchAll=false` green
- [ ] `yarn pretty-check .` and `yarn lint-check src` pass

---

## Phase 2 — Custom Format Pinning

### Goal
Allow users to "pin" a custom format (from the Custom tab) as a persistent named tab
button so they can return to it without re-entering widths.

### 2-A — New hook `src/hooks/usePinnedFormats.ts`

```ts
import { useCallback } from "react";
import useLocalStorage from "./useLocalStorage";

export interface PinnedFormat {
  id: string;            // unique: `${Date.now()}-${Math.random().toString(36).slice(2)}`
  name: string;          // user-chosen label
  exponentWidth: number;
  significandWidth: number;
  urlPath: string;       // `/custom-pinned-${id}`
  pageTitle: string;     // `${name} Converter`
}

export const usePinnedFormats = (): {
  pinnedFormats: PinnedFormat[];
  pinFormat: (name: string, exp: number, sig: number) => void;
  unpinFormat: (id: string) => void;
} => {
  const [pinnedFormats, setPinnedFormats] = useLocalStorage<PinnedFormat[]>(
    "pinned-formats",
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
    (id: string) =>
      setPinnedFormats(pinnedFormats.filter((p) => p.id !== id)),
    [pinnedFormats, setPinnedFormats]
  );

  return { pinnedFormats, pinFormat, unpinFormat };
};
```

Add to `src/constants.ts`:
```ts
export const PINNED_FORMATS_KEY = "pinned-formats";
export const PIN_FORMAT_BUTTON_STRING = "📌 Pin this format";
export const UNPIN_TOOLTIP_STRING = "Remove pinned format";
export const PIN_NAME_PLACEHOLDER = "Name this format…";
```

### 2-B — Pin UI in `CustomFormatConverter.tsx`

1. Accept `pinFormat` as a prop (passed from `App`), or call `usePinnedFormats()` locally
   (either approach is acceptable; prefer passing from `App` to keep one source of truth).
2. Add a name `<input>` and a `Pin` button below the width panel:
   ```tsx
   <PinSection>
     <PinNameInput
       value={pinName}
       onChange={(e) => setPinName(e.target.value)}
       placeholder={PIN_NAME_PLACEHOLDER}
     />
     <PinButton
       onClick={() =>
         pinFormat(
           pinName.trim() || `Custom E${exponentWidth}M${significandWidth}`,
           exponentWidth,
           significandWidth
         )
       }
     >
       {PIN_FORMAT_BUTTON_STRING}
     </PinButton>
   </PinSection>
   ```
3. Style `PinSection`, `PinNameInput`, `PinButton` with `styled-components` using
   `ACCENT_COLOR` for the button active/hover state.

### 2-C — Wire pinned tabs in `App.tsx`

1. Call `usePinnedFormats()` in `App`.
2. Include pinned formats between predefined and Custom:
   ```ts
   const tabs = useMemo(
     () => [...FORMATS, ...pinnedFormats, CUSTOM],
     [pinnedFormats]
   );
   ```
3. Add dynamic `<Route>` entries:
   ```tsx
   {pinnedFormats.map((pf) => (
     <Route key={pf.id} path={pf.urlPath}>
       <FormatConverter
         name={pf.name}
         exponentWidth={pf.exponentWidth}
         significandWidth={pf.significandWidth}
       />
     </Route>
   ))}
   ```

### 2-D — Extend `TabBar.tsx` for removable tabs

Extend the tab descriptor shape to include an optional `onRemove` callback:
```ts
// TabBar props
tabs: {
  name: string;
  urlPath: string;
  onRemove?: () => void;
}[];
```

When `onRemove` is provided, render a small `×` button inside the `TabButton`.
The `×` click must call `onRemove` and `stopPropagation()` to prevent tab activation.

In `App.tsx`, pass `onRemove` only for pinned tabs:
```ts
const tabs = useMemo(
  () => [
    ...FORMATS.map((f) => ({ ...f })),
    ...pinnedFormats.map((pf) => ({
      ...pf,
      onRemove: () => unpinFormat(pf.id),
    })),
    CUSTOM,
  ],
  [pinnedFormats, unpinFormat]
);
```

### Verification
- [ ] In Custom tab, set E=4 M=3, enter name "My E4M3", click Pin → new tab appears
- [ ] Clicking `×` on a pinned tab removes it immediately
- [ ] Pinned tabs survive page refresh (localStorage persisted)
- [ ] Predefined tabs have no `×` button
- [ ] `yarn test --watchAll=false` green
- [ ] `yarn pretty-check .` and `yarn lint-check src` pass

---

## Phase 3 — Per-Format Conversion History

### Goal
Track values the user **commits** (Enter key or Copy button) per format. Render a
collapsible history panel. Clicking an entry re-loads the conversion.

### 3-A — New hook `src/hooks/useFormatHistory.ts`

```ts
import { useCallback } from "react";
import useLocalStorage from "./useLocalStorage";

export interface HistoryEntry {
  id: string;
  timestamp: number;     // Date.now()
  decimalInput: string;  // raw user string, e.g. "3.14"
  storedValue: string;   // stringified back-converted result
  binaryRep: string;     // full bit string
  hexRep: string;        // hex string (without "0x" prefix)
}

const MAX_HISTORY = 100;

export const useFormatHistory = (
  formatName: string
): {
  history: HistoryEntry[];
  addEntry: (e: Omit<HistoryEntry, "id" | "timestamp">) => void;
  clearHistory: () => void;
} => {
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(
    `${formatName}-history`,
    []
  );

  const addEntry = useCallback(
    (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
      const newEntry: HistoryEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: Date.now(),
      };
      setHistory([newEntry, ...history].slice(0, MAX_HISTORY));
    },
    [history, setHistory]
  );

  const clearHistory = useCallback(() => setHistory([]), [setHistory]);

  return { history, addEntry, clearHistory };
};
```

Add to `src/constants.ts`:
```ts
export const HISTORY_STORAGE_KEY = "-history";
export const MAX_HISTORY_ENTRIES = 100;
export const HISTORY_PANEL_TITLE = "History";
export const HISTORY_CLEAR_BUTTON_STRING = "Clear";
```

### 3-B — Modify `Panel.tsx` to emit commit events

**Key rule**: record only on explicit commit, never on every keystroke.

1. Add `onCommit: (decimalInput: string) => void` to `PanelProps`.
2. Decimal `InputField` — add `onKeyDown`:
   ```ts
   onKeyDown={(e) => {
     if (e.key === "Enter") props.onCommit(decimalInput);
   }}
   ```
3. The decimal Copy button `onClick` — also call `onCommit` after copying:
   ```ts
   onClick={() => {
     onCopyButton(decimalInput);
     props.onCommit(decimalInput);
   }}
   ```

### 3-C — Modify `FormatConverter.tsx` to record history

1. Call `useFormatHistory(props.name)` → `{ history, addEntry, clearHistory }`.
2. Import `stringifyBits` and `stringifyBitsToHex` from `./flop`.
3. Pass `onCommit` to `Panel`:
   ```tsx
   onCommit={(inputValue: string) => {
     if (inputValue.length === 0) return;
     addEntry({
       decimalInput: inputValue,
       storedValue: safeStringifyFlop(
         storedFlop,
         scientificNotation,
         props.supportsInfinity,
         props.supportsNaN
       ),
       binaryRep: stringifyBits([sign, exponent, significand].flat()),
       hexRep: stringifyBitsToHex([sign, exponent, significand].flat()),
     });
   }}
   ```
4. Render `<HistoryPanel>` below `<ConfigPanel>`:
   ```tsx
   <HistoryPanel
     formatName={props.name}
     history={history}
     onSelect={(entry) => onFlopUpdate(generateFlop(entry.decimalInput))}
     onClear={clearHistory}
   />
   ```

### 3-D — New component `src/converter/HistoryPanel.tsx`

```ts
interface HistoryPanelProps {
  formatName: string;
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}
```

Layout (all via `styled-components`):
- **Toggle button**: `"▶ History (N)"` collapsed / `"▼ History (N)"` expanded.
  Use a CSS `max-height` transition (`max-height: 0` ↔ `max-height: 30rem`) for the
  open/close animation.
- **Scrollable list** (`overflow-y: auto; max-height: 24rem`): one `HistoryRow` per entry.
- Each `HistoryRow` displays:
  - Timestamp formatted as `HH:MM:SS` (local time)
  - Decimal input (`MONOSPACED_FONT_FAMILY`)
  - Stored value (`MONOSPACED_FONT_FAMILY`)
- Hover: `background-color` highlight using `ACCENT_COLOR` at low opacity.
- Clicking a row calls `props.onSelect(entry)`.
- **"Clear" button** in the panel header calls `props.onClear()`.

### Verification
- [ ] Typing "3.14" + Enter → history entry appears immediately
- [ ] Typing character-by-character does **not** add entries
- [ ] Clicking the decimal "Copy" button adds an entry
- [ ] Clicking a history row re-loads the value and shows its conversion results
- [ ] History panel is collapsible with smooth animation
- [ ] History survives page refresh
- [ ] "Clear" empties the history list
- [ ] `yarn test --watchAll=false` green
- [ ] `yarn pretty-check .` and `yarn lint-check src` pass

---

## Phase 4 — History Export (Markdown & CSV/Excel)

### Goal
Add "Export MD" and "Export CSV" buttons to `HistoryPanel` using only native browser APIs.

### 4-A — Pure export utility `src/converter/exportHistory.ts`

```ts
import { HistoryEntry } from "../hooks/useFormatHistory";

const fmt = (ts: number): string =>
  new Date(ts).toISOString().replace("T", " ").slice(0, 19);

const download = (filename: string, content: string, mime: string): void => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportAsMarkdown = (
  formatName: string,
  history: HistoryEntry[]
): void => {
  const header = `# ${formatName} — Conversion History\n\n`;
  const tableHead =
    "| # | Time (UTC) | Decimal Input | Value Stored | Binary | Hex |\n" +
    "|---|-----------|--------------|-------------|--------|-----|\n";
  const rows = history
    .map(
      (e, i) =>
        `| ${i + 1} | ${fmt(e.timestamp)} | \`${e.decimalInput}\` | \`${e.storedValue}\` | \`${e.binaryRep}\` | \`0x${e.hexRep}\` |`
    )
    .join("\n");
  download(`${formatName}-history.md`, header + tableHead + rows, "text/markdown");
};

export const exportAsCSV = (
  formatName: string,
  history: HistoryEntry[]
): void => {
  const header = "Index,Time (UTC),Decimal Input,Value Stored,Binary,Hex\r\n";
  const rows = history
    .map((e, i) =>
      [
        i + 1,
        fmt(e.timestamp),
        `"${e.decimalInput}"`,
        `"${e.storedValue}"`,
        `"${e.binaryRep}"`,
        `"0x${e.hexRep}"`,
      ].join(",")
    )
    .join("\r\n");
  // UTF-8 BOM (\uFEFF) ensures Excel auto-detects encoding correctly
  download(
    `${formatName}-history.csv`,
    "\uFEFF" + header + rows,
    "text/csv;charset=utf-8;"
  );
};
```

### 4-B — Add export buttons to `HistoryPanel.tsx`

In the panel header (next to "Clear"), add:
```tsx
<ExportButton
  disabled={props.history.length === 0}
  onClick={() => exportAsMarkdown(props.formatName, props.history)}
>
  {EXPORT_MD_BUTTON_STRING}
</ExportButton>
<ExportButton
  disabled={props.history.length === 0}
  onClick={() => exportAsCSV(props.formatName, props.history)}
>
  {EXPORT_CSV_BUTTON_STRING}
</ExportButton>
```

Style `ExportButton` disabled state: `opacity: 0.4; cursor: not-allowed`.

### 4-C — New constants

Add to `src/constants.ts`:
```ts
export const EXPORT_MD_BUTTON_STRING = "⬇ Export MD";
export const EXPORT_CSV_BUTTON_STRING = "⬇ Export CSV";
```

### Verification
- [ ] With ≥1 history entry, "Export MD" triggers a download of `<format>-history.md`
- [ ] The downloaded Markdown file contains a valid GFM table with correct columns
- [ ] With ≥1 history entry, "Export CSV" triggers a download of `<format>-history.csv`
- [ ] Opening the CSV in Excel (macOS Numbers or LibreOffice) shows columns correctly
  with no encoding artifacts (BOM present)
- [ ] Both buttons are disabled / greyed when history is empty
- [ ] Export does not mutate history state (pure function, no side effects on state)
- [ ] `yarn test --watchAll=false` green
- [ ] `yarn pretty-check .` and `yarn lint-check src` pass

---

## Cross-Cutting Constraints (apply to ALL phases)

- **Package manager**: `yarn` only — never `npm`.
- **No new third-party libraries** unless the task provably cannot be done with
  `bignumber.js` or native browser APIs. No exceptions.
- **No `console.log`** in production code paths. The existing one in
  `CustomFormatConverter.tsx` is a known tech debt — do not add more.
- All new constants: `SCREAMING_SNAKE_CASE`, exported from `src/constants.ts`.
- All styled-components: use tokens (`ACCENT_COLOR`, `BACKGROUND_COLOR`,
  `MAIN_FONT_FAMILY`, `MONOSPACED_FONT_FAMILY`) — never hard-coded hex values.
- TypeScript strict mode must stay satisfied (`yarn build` must succeed after every phase).
- `App.test.tsx` smoke test must remain green throughout.

---

## Final CI Gate

After all phases are done, run once more:

```sh
yarn pretty-check .       # must exit 0
yarn lint-check src       # must exit 0
yarn test --watchAll=false # must exit 0
yarn build                # must exit 0
```
