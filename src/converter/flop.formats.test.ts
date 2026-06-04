import { FP4_E2M1, FP8_E4M3, FP8_E5M2 } from "../constants";
import { convertFlopToFlop754, Flop754Type, generateFlop } from "./flop";

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
