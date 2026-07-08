import React, { FC, ReactElement, useState } from "react";
import styled from "styled-components";

import {
  ACCENT_COLOR,
  BACKGROUND_COLOR,
  CUSTOM_EXPONENT_FIELD_NAME,
  CUSTOM_EXPONENT_KEY,
  CUSTOM_SIGNIFICAND_FIELD_NAME,
  CUSTOM_SIGNIFICAND_KEY,
  FIXED_SIGN_FIELD_NAME,
  PIN_FORMAT_BUTTON_STRING,
  PIN_NAME_PLACEHOLDER,
  TOTAL_WIDTH_FIELD_NAME,
} from "../constants";
import useLocalStorage from "../hooks/useLocalStorage";
import FormatConverter from "./FormatConverter";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

const CustomConfigContainer = styled.div`
  display: flex;
  gap: 2rem;
  width: 100%;
  box-sizing: border-box;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const WidthPanel = styled.div`
  flex: 3;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.5rem;
  padding: 1rem 1.5rem;
  width: 100%;
`;

const Row = styled.div`
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);

  &:last-child {
    border-bottom: none;
  }
`;

const Col = styled.div<{ size: number }>`
  flex: ${(props) => props.size};
  display: flex;
  align-items: center;
`;

const FieldName = styled.div`
  white-space: nowrap;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
`;

const NumberInputField = styled.input.attrs({
  type: "number",
})`
  width: 100%;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  color: white;
  padding: 0.4rem 0.6rem;
  font-family: inherit;
  font-size: 0.95rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${ACCENT_COLOR};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: rgba(255, 255, 255, 0.02);
    border-color: rgba(255, 255, 255, 0.05);
  }
`;

const PinSection = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-sizing: border-box;
  width: 100%;
`;

const PinLabel = styled.div`
  font-size: 0.95rem;
  font-weight: 500;
  color: ${ACCENT_COLOR};
`;

const PinNameInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  background-color: transparent;
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
`;

const PinButton = styled.button`
  background-color: transparent;
  border: 1px solid ${ACCENT_COLOR};
  border-radius: 4px;
  color: ${ACCENT_COLOR};
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
  margin-top: 0.4rem;

  &:hover {
    background-color: ${ACCENT_COLOR};
    color: ${BACKGROUND_COLOR};
  }
`;

interface CustomFormatPanelProps {
  name: string;
  minExponentWidth: number;
  maxExponentWidth: number;
  minSignificandWidth: number;
  maxSignificandWidth: number;
  pinFormat: (name: string, exp: number, sig: number) => void;
}

// TODO: Refactor the CSS in this component
const CustomFormatConverter: FC<CustomFormatPanelProps> = (
  props: CustomFormatPanelProps
): ReactElement => {
  const [pinName, setPinName] = useState("");
  const [exponentWidth, setExponentWidth] = useLocalStorage(
    `${props.name}${CUSTOM_EXPONENT_KEY}`,
    props.minExponentWidth
  );
  const [significandWidth, setSignificandWidth] = useLocalStorage(
    `${props.name}${CUSTOM_SIGNIFICAND_KEY}`,
    props.minSignificandWidth
  );

  const onExponentUpdate = (value: number, valid: boolean) => {
    if (valid && !isNaN(value)) {
      console.log(value, valid);
      setExponentWidth(value);
    }
  };

  const onSignificandUpdate = (value: number, valid: boolean) => {
    if (valid && !isNaN(value)) {
      setSignificandWidth(value);
    }
  };

  return (
    <Wrapper>
      <CustomConfigContainer>
        <WidthPanel>
          {/* Sign Width */}
          <Row>
            <Col size={2}>
              <FieldName>{FIXED_SIGN_FIELD_NAME}</FieldName>
            </Col>
            <Col size={1}>
              <NumberInputField
                title={FIXED_SIGN_FIELD_NAME}
                disabled
                readOnly
                value={1}
              />
            </Col>
          </Row>
          {/* Exponent Width */}
          <Row>
            <Col size={2}>
              <FieldName>{CUSTOM_EXPONENT_FIELD_NAME}</FieldName>
            </Col>
            <Col size={1}>
              <NumberInputField
                title={CUSTOM_EXPONENT_FIELD_NAME}
                min={props.minExponentWidth}
                max={props.maxExponentWidth}
                value={exponentWidth}
                onChange={(e) =>
                  onExponentUpdate(
                    parseInt(e.target.value),
                    e.target.validity.valid
                  )
                }
              />
            </Col>
          </Row>
          {/* Significand Width */}
          <Row>
            <Col size={2}>
              <FieldName>{CUSTOM_SIGNIFICAND_FIELD_NAME}</FieldName>
            </Col>
            <Col size={1}>
              <NumberInputField
                title={CUSTOM_SIGNIFICAND_FIELD_NAME}
                min={props.minSignificandWidth}
                max={props.maxSignificandWidth}
                value={significandWidth}
                onChange={(e) =>
                  onSignificandUpdate(
                    parseInt(e.target.value),
                    e.target.validity.valid
                  )
                }
              />
            </Col>
          </Row>
          {/* Total Width */}
          <Row>
            <Col size={2}>
              <FieldName>{TOTAL_WIDTH_FIELD_NAME}</FieldName>
            </Col>
            <Col size={1}>
              <NumberInputField
                title={TOTAL_WIDTH_FIELD_NAME}
                disabled
                readOnly
                value={1 + significandWidth + exponentWidth}
              />
            </Col>
          </Row>
        </WidthPanel>
        <PinSection>
          <PinLabel>Pin Custom Format</PinLabel>
          <PinNameInput
            value={pinName}
            onChange={(e) => setPinName(e.target.value)}
            placeholder={PIN_NAME_PLACEHOLDER}
          />
          <PinButton
            onClick={() => {
              props.pinFormat(
                pinName.trim() ||
                  `Custom E${exponentWidth}M${significandWidth}`,
                exponentWidth,
                significandWidth
              );
              setPinName("");
            }}
          >
            {PIN_FORMAT_BUTTON_STRING}
          </PinButton>
        </PinSection>
      </CustomConfigContainer>
      <FormatConverter
        name={props.name}
        exponentWidth={exponentWidth}
        significandWidth={significandWidth}
      />
    </Wrapper>
  );
};

export default CustomFormatConverter;
