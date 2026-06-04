// app
export const APP_TITLE = "IEEE 754-Style Floating-Point Converter";
export const GA_UA_ID = "UA-165443113-2";
export const UI_ACKNOWLEDGEMENT_URL =
  "https://www.h-schmidt.net/FloatConverter/IEEE754.html";
export const UI_ACKNOWLEDGEMENT_TEXT = {
  pre: "Converter UI from ",
  link: "h-schmidt's floating-point converter",
  post: ".",
};
export const BIGNUM_ACKNOWLEDGEMENT_URL =
  "https://mikemcl.github.io/bignumber.js/";
export const BIGNUM_ACKNOWLEDGEMENT_TEXT = {
  pre: "Conversion routines powered by the ",
  link: "bignumber.js",
  post: " library.",
};
export const ISSUES_CONTRIBUTION_URL = "https://github.com/afterdusk/flop";
export const ISSUES_CONTRIBUTION_TEXT = {
  pre: "Please report any issues on the ",
  link: "GitHub repo",
  post: ". Contributions are also welcome 😊",
};
export const BUILD_SOURCE_URL = `https://github.com/afterdusk/flop/tree/${process.env.REACT_APP_GIT_SHA}`;
export const BUILD_SOURCE_TEXT = {
  pre: `Version ${process.env.REACT_APP_VERSION}, Build `,
  link: `${process.env.REACT_APP_GIT_SHA}`,
  post: "",
};
export const IS_TEST_ENV = process.env.NODE_ENV === "test";
export const DECIMAL_INPUT_FIELD_NAME = "Decimal Input";
export const VALUE_STORED_FIELD_NAME = "Value Stored";
export const ERROR_FIELD_NAME = "Error";
export const BIT_REPRESENTATION_FIELD_NAME = "Binary Representation";
export const HEX_REPRESENTATION_FIELD = "Hex Representation";
export const ROUNDING_MODE_FIELD_NAME = "Rounding Mode";
export const NOTATION_FIELD_NAME = "Result Notation";
export const FIXED_SIGN_FIELD_NAME = "Sign Length";
export const CUSTOM_EXPONENT_FIELD_NAME = "Exponent Length";
export const CUSTOM_SIGNIFICAND_FIELD_NAME = "Significand Length";
export const TOTAL_WIDTH_FIELD_NAME = "Total Length";
export const CLIPBOARD_TOOLTIP_STRING = "Copy to Clipboard";
export const CLIPBOARD_BUTTON_STRING = "Copy";
export const POSITIVE_INFINITY_STRING = "infinity";
export const NEGATIVE_INFINITY_STRING = "-infinity";
export const NAN_STRING = "NaN";
export const HEX_PREFIX_STRING = "0x";
export const PIN_FORMAT_BUTTON_STRING = "📌 Pin this format";
export const UNPIN_TOOLTIP_STRING = "Remove pinned format";
export const PIN_NAME_PLACEHOLDER = "Name this format…";

// local storage
export const DECIMAL_INPUT_STORAGE_KEY = "-input";
export const FLOP_STORAGE_KEY = "-flop";
export const FLOP754_STORAGE_KEY = "-flop754";
export const ROUNDING_STORAGE_KEY = "-rounding";
export const NOTATION_STORAGE_KEY = "-notation";
export const CUSTOM_EXPONENT_KEY = "custom-exponent";
export const CUSTOM_SIGNIFICAND_KEY = "custom-significand";
export const PINNED_FORMATS_KEY = "pinned-formats";

// styling
export const BACKGROUND_COLOR = "#0e171c";
export const ACCENT_COLOR = "#039cfd";
export const MAIN_FONT_FAMILY = `'Roboto', sans-serif;`;
export const MONOSPACED_FONT_FAMILY = `'Roboto Mono', monospace`;

// bignumber.js
export const BIGNUMBER_DECIMAL_PLACES = 3000;

// rounding
export enum ROUNDING_MODE {
  halfToEven,
  towardZero,
}

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

export const INFINITY_NOT_SUPPORTED_STRING =
  "[±Infinity not supported by this format]";
export const NAN_NOT_SUPPORTED_STRING = "[NaN not supported by this format]";

// formats
export const FP32: FormatDefinition = {
  name: "FP32",
  exponentWidth: 8,
  significandWidth: 23,
  urlPath: "/float-converter",
  pageTitle: "Float Converter",
};
export const FP64: FormatDefinition = {
  name: "FP64",
  exponentWidth: 11,
  significandWidth: 52,
  urlPath: "/double-converter",
  pageTitle: "Double Converter",
};
export const FP16: FormatDefinition = {
  name: "FP16",
  exponentWidth: 5,
  significandWidth: 10,
  urlPath: "/half-precision-converter",
  pageTitle: "Half Precision Converter",
};
export const BF16: FormatDefinition = {
  name: "bfloat16",
  exponentWidth: 8,
  significandWidth: 7,
  urlPath: "/brainfloat-converter",
  pageTitle: "Brain Float Converter",
};
export const TF32: FormatDefinition = {
  name: "TensorFloat-32",
  exponentWidth: 8,
  significandWidth: 10,
  urlPath: "/tensorfloat-converter",
  pageTitle: "TensorFloat Converter",
};
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
  supportsInfinity: false, // E4M3 has no ±Inf encoding by spec
  supportsNaN: true, // one NaN pattern: all-1s exponent + all-1s mantissa
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

export const FORMATS: FormatDefinition[] = [
  FP32,
  FP64,
  FP16,
  BF16,
  TF32,
  FP8_E5M2,
  FP8_E4M3,
  FP4_E2M1,
];
export const DEFAULT_FORMAT_INDEX = 0;
export const CUSTOM = {
  name: "Custom",
  minExponentWidth: 2,
  maxExponentWidth: 11,
  minSignificandWidth: 1,
  maxSignificandWidth: 52,
  urlPath: "/arbitrary-float-converter",
  pageTitle: "Arbitrary Float Converter",
};
