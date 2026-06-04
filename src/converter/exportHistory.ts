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
        `| ${i + 1} | ${fmt(e.timestamp)} | \`${e.decimalInput}\` | \`${
          e.storedValue
        }\` | \`${e.binaryRep}\` | \`0x${e.hexRep}\` |`
    )
    .join("\n");
  download(
    `${formatName}-history.md`,
    header + tableHead + rows,
    "text/markdown"
  );
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
  // UTF-8 BOM (\\uFEFF) ensures Excel auto-detects encoding correctly
  download(
    `${formatName}-history.csv`,
    "\uFEFF" + header + rows,
    "text/csv;charset=utf-8;"
  );
};
