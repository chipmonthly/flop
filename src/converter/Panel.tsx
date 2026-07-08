import React, { FC, ReactElement, useEffect, useState } from "react";
import styled from "styled-components";
import { useClipboard } from "use-clipboard-copy";

import {
  ACCENT_COLOR,
  BACKGROUND_COLOR,
  BIT_REPRESENTATION_FIELD_NAME,
  CLIPBOARD_BUTTON_STRING,
  CLIPBOARD_TOOLTIP_STRING,
  DECIMAL_INPUT_FIELD_NAME,
  ERROR_FIELD_NAME,
  HEX_PREFIX_STRING,
  HEX_REPRESENTATION_FIELD,
  MONOSPACED_FONT_FAMILY,
  VALUE_STORED_FIELD_NAME,
} from "../constants";
import {
  bitsFromHexString,
  bitsFromString,
  stringifyBits,
  stringifyBitsToHex,
} from "./flop";

const Wrapper = styled.div`
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.5rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
`;

const Row = styled.div`
  min-height: 1.4rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Col = styled.div<{ size: number }>`
  flex: ${(props) => props.size};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
`;

const FieldName = styled.div`
  white-space: nowrap;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  width: 100%;
`;

const InputField = styled.input`
  width: 100%;
  box-sizing: border-box;
  background-color: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  color: white;
  padding: 0.4rem 0.6rem;
  font-family: inherit;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: ${ACCENT_COLOR};
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    background-color: rgba(255, 255, 255, 0.02);
    border-color: rgba(255, 255, 255, 0.05);
  }

  &:invalid {
    border-color: #ff4d4f;
    background-color: rgba(255, 77, 79, 0.05);
  }
`;

const ClipboardButton = styled.button`
  background-color: transparent;
  color: ${ACCENT_COLOR};
  border: 1px solid rgba(3, 156, 253, 0.3);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.4rem 0.75rem;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: ${ACCENT_COLOR};
    color: ${BACKGROUND_COLOR};
    border-color: ${ACCENT_COLOR};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const HexPrefix = styled.span`
  font-family: ${MONOSPACED_FONT_FAMILY};
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.45);
  margin-right: 0.25rem;
`;

interface PanelProps {
  formatName: string;
  clearInput: boolean;
  decimalInput: string;
  setDecimalInput: (value: string) => void;
  stored: string;
  error: string;
  bits: boolean[];
  updateInputValue: (inputValue: string) => void;
  updateValue: (bits: boolean[]) => void;
  onCommit: (decimalInput: string) => void;
}

const Panel: FC<PanelProps> = (props: PanelProps): ReactElement => {
  const { decimalInput, setDecimalInput } = props;
  const [binaryRep, setBinaryRep] = useState(stringifyBits(props.bits));
  const [hexRep, setHexRep] = useState(stringifyBitsToHex(props.bits));

  // for copying to clipboard
  const clipboard = useClipboard();

  useEffect(() => {
    if (props.clearInput) {
      setDecimalInput("");
    }
  }, [props.clearInput, setDecimalInput]);

  useEffect(() => {
    setBinaryRep(stringifyBits(props.bits));
    setHexRep(stringifyBitsToHex(props.bits));
  }, [props.bits]);

  const onDecimalInput = (input: string, valid: boolean) => {
    setDecimalInput(input);
    if (valid) {
      props.updateInputValue(input);
    }
  };

  const onBinaryInput = (input: string, valid: boolean) => {
    setBinaryRep(input);
    if (valid) {
      props.updateValue(bitsFromString(input));
    }
  };

  const onHexInput = (input: string, valid: boolean) => {
    setHexRep(input);
    if (valid) {
      props.updateValue(bitsFromHexString(input, props.bits.length));
    }
  };

  const onCopyButton = (text: string) => {
    clipboard.copy(text);
  };

  return (
    <Wrapper>
      {/* Decimal Input */}
      <Row>
        <Col size={2}>
          <FieldName>{DECIMAL_INPUT_FIELD_NAME}</FieldName>
        </Col>
        <Col size={5}>
          <InputField
            title={DECIMAL_INPUT_FIELD_NAME}
            autoFocus
            pattern={`^[+-]?\\d*(?:\\.?\\d*(?:[eE][+-]?\\d+)?)?$`}
            value={decimalInput}
            onChange={(e) =>
              onDecimalInput(e.target.value, e.target.validity.valid)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                props.onCommit(decimalInput);
              }
            }}
          />
          <ClipboardButton
            title={CLIPBOARD_TOOLTIP_STRING}
            onClick={() => {
              onCopyButton(decimalInput);
              props.onCommit(decimalInput);
            }}
          >
            {CLIPBOARD_BUTTON_STRING}
          </ClipboardButton>
        </Col>
      </Row>
      {/* Value Stored */}
      <Row>
        <Col size={2}>
          <FieldName>{VALUE_STORED_FIELD_NAME}</FieldName>
        </Col>
        <Col size={5}>
          <InputField
            title={VALUE_STORED_FIELD_NAME}
            disabled
            readOnly
            value={props.stored}
          />
          <ClipboardButton
            title={CLIPBOARD_TOOLTIP_STRING}
            onClick={() => onCopyButton(props.stored)}
          >
            {CLIPBOARD_BUTTON_STRING}
          </ClipboardButton>
        </Col>
      </Row>
      {/* Error */}
      <Row>
        <Col size={2}>
          <FieldName>{ERROR_FIELD_NAME}</FieldName>
        </Col>
        <Col size={5}>
          <InputField
            title={ERROR_FIELD_NAME}
            disabled
            readOnly
            value={props.error}
          />
          <ClipboardButton
            title={CLIPBOARD_TOOLTIP_STRING}
            onClick={() => onCopyButton(props.error)}
          >
            {CLIPBOARD_BUTTON_STRING}
          </ClipboardButton>
        </Col>
      </Row>
      {/* Binary Representation */}
      <Row>
        <Col size={2}>
          <FieldName>{BIT_REPRESENTATION_FIELD_NAME}</FieldName>
        </Col>
        <Col size={5}>
          <InputField
            title={BIT_REPRESENTATION_FIELD_NAME}
            required
            pattern={`^[01]{${props.bits.length}}$`}
            value={binaryRep}
            onChange={(e) =>
              onBinaryInput(e.target.value, e.target.validity.valid)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                props.onCommit(decimalInput || props.stored);
              }
            }}
          />
          <ClipboardButton
            title={CLIPBOARD_TOOLTIP_STRING}
            onClick={() => onCopyButton(binaryRep)}
          >
            {CLIPBOARD_BUTTON_STRING}
          </ClipboardButton>
        </Col>
      </Row>
      {/* Hexadecimal Representation */}
      <Row>
        <Col size={2}>
          <FieldName>{HEX_REPRESENTATION_FIELD}</FieldName>
        </Col>
        <Col size={5}>
          <HexPrefix>{HEX_PREFIX_STRING}</HexPrefix>
          <InputField
            title={HEX_REPRESENTATION_FIELD}
            required
            pattern={`^[a-fA-F0-9]{${Math.ceil(props.bits.length / 4)}}$`}
            value={hexRep}
            ref={clipboard.target}
            onChange={(e) =>
              onHexInput(e.target.value, e.target.validity.valid)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                props.onCommit(decimalInput || props.stored);
              }
            }}
          />
          <ClipboardButton
            title={CLIPBOARD_TOOLTIP_STRING}
            onClick={() => onCopyButton(hexRep)}
          >
            {CLIPBOARD_BUTTON_STRING}
          </ClipboardButton>
        </Col>
      </Row>
    </Wrapper>
  );
};

export default Panel;
