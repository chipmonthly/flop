import { HistoryEntry } from "../hooks/useFormatHistory";
import { exportAsCSV, exportAsMarkdown } from "./exportHistory";

describe("exportHistory", () => {
  let mockClick: jest.Mock;
  let mockRevoke: jest.Mock;
  let mockCreateObjectURL: jest.Mock;
  let blobContent: string[] = [];
  let OriginalBlob: typeof Blob;

  beforeEach(() => {
    mockClick = jest.fn();
    mockRevoke = jest.fn();
    mockCreateObjectURL = jest.fn().mockReturnValue("blob:mock-url");
    blobContent = [];

    // Mock document.createElement
    jest
      .spyOn(document, "createElement")
      .mockImplementation((tagName: string) => {
        if (tagName === "a") {
          return ({
            href: "",
            download: "",
            click: mockClick,
          } as unknown) as HTMLAnchorElement;
        }
        return ({} as unknown) as HTMLElement;
      });

    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevoke;

    // Mock Blob to capture content
    OriginalBlob = global.Blob;
    const spyBlob = jest.fn((chunks: BlobPart[], options?: BlobPropertyBag) => {
      blobContent.push(chunks.join(""));
      return new OriginalBlob(chunks, options);
    });
    global.Blob = (spyBlob as unknown) as typeof Blob;
  });

  afterEach(() => {
    global.Blob = OriginalBlob;
    jest.restoreAllMocks();
  });

  const history: HistoryEntry[] = [
    {
      id: "1",
      timestamp: 1685874600000, // 2023-06-04T10:30:00.000Z
      decimalInput: "3.14",
      storedValue: "3.1400001",
      binaryRep: "01000000010010001111010111000011",
      hexRep: "4048f5c3",
    },
  ];

  it("exports as markdown correctly", () => {
    exportAsMarkdown("FP32", history, 8);
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevoke).toHaveBeenCalledWith("blob:mock-url");
    expect(blobContent[0]).toContain("# FP32 — Conversion History");
    expect(blobContent[0]).toContain(
      "| 1 | 2023-06-04 10:30:00 | `3.14` | `3.1400001` | `0` | `01000000010010001111010111000011` | `0x4048f5c3` | `0` | `10000000` | `10010001111010111000011` |"
    );
  });

  it("exports as csv correctly", () => {
    exportAsCSV("FP32", history, 8);
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevoke).toHaveBeenCalledWith("blob:mock-url");
    expect(blobContent[0]).toContain(
      "\uFEFFIndex,Time (UTC),Decimal Input,Value Stored,Error,Binary,Hex,Sign,Exponent,Mantissa"
    );
    expect(blobContent[0]).toContain(
      '1,2023-06-04 10:30:00,"3.14","3.1400001","0","01000000010010001111010111000011","0x4048f5c3","0","10000000","10010001111010111000011"'
    );
  });
});
