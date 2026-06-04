import { FP4_E2M1, FP8_E4M3, FP8_E5M2 } from "../constants";
import {
  convertFlop754ToFlop,
  convertFlopToFlop754,
  Flop754Type,
  generateFlop,
  generateFlop754,
} from "./flop";

describe("FP8 E5M2", () => {
  it("has total bit width of 8", () => {
    expect(1 + FP8_E5M2.exponentWidth + FP8_E5M2.significandWidth).toBe(8);
  });
  it("encodes a very large number as +Infinity", () => {
    const result = convertFlopToFlop754(
      generateFlop("1e40"),
      FP8_E5M2.exponentWidth,
      FP8_E5M2.significandWidth,
      undefined,
      FP8_E5M2.supportsInfinity,
      FP8_E5M2.supportsNaN
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
  it("saturates a very large number to 448 (instead of infinity)", () => {
    const result754 = convertFlopToFlop754(
      generateFlop("1e40"),
      FP8_E4M3.exponentWidth,
      FP8_E4M3.significandWidth,
      undefined,
      FP8_E4M3.supportsInfinity,
      FP8_E4M3.supportsNaN
    );
    expect(result754.type).toBe(Flop754Type.NORMAL);
    expect(result754.exponent).toBe(8);
    expect(result754.significand.toNumber()).toBe(1.75); // 1.110 in binary

    const resultFlop = convertFlop754ToFlop(result754);
    expect(resultFlop.value.toNumber()).toBe(448);
  });
  it("treats 0 1111 000 as normal value 256", () => {
    const result754 = generateFlop754(
      [false],
      [true, true, true, true],
      [false, false, false],
      FP8_E4M3.supportsInfinity,
      FP8_E4M3.supportsNaN
    );
    expect(result754.type).toBe(Flop754Type.NORMAL);
    const resultFlop = convertFlop754ToFlop(result754);
    expect(resultFlop.value.toNumber()).toBe(256);
  });
  it("treats 0 1111 111 as NaN", () => {
    const result754 = generateFlop754(
      [false],
      [true, true, true, true],
      [true, true, true],
      FP8_E4M3.supportsInfinity,
      FP8_E4M3.supportsNaN
    );
    expect(result754.type).toBe(Flop754Type.NAN);
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
  it("saturates a very large number to 6 (instead of infinity)", () => {
    const result754 = convertFlopToFlop754(
      generateFlop("1e40"),
      FP4_E2M1.exponentWidth,
      FP4_E2M1.significandWidth,
      undefined,
      FP4_E2M1.supportsInfinity,
      FP4_E2M1.supportsNaN
    );
    expect(result754.type).toBe(Flop754Type.NORMAL);
    expect(result754.exponent).toBe(2);
    expect(result754.significand.toNumber()).toBe(1.5); // 1.1 in binary

    const resultFlop = convertFlop754ToFlop(result754);
    expect(resultFlop.value.toNumber()).toBe(6);
  });
  it("treats 0 11 1 as normal value 6 (no NaN support)", () => {
    const result754 = generateFlop754(
      [false],
      [true, true],
      [true],
      FP4_E2M1.supportsInfinity,
      FP4_E2M1.supportsNaN
    );
    expect(result754.type).toBe(Flop754Type.NORMAL);
    const resultFlop = convertFlop754ToFlop(result754);
    expect(resultFlop.value.toNumber()).toBe(6);
  });
});
