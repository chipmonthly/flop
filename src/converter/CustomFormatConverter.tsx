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

const Wrapper = React.Fragment;

const WidthPanel = styled.div`
  max-width: 60%;
  box-sizing: border-box;
  padding: 2rem 0 0 0;
`;

const Row = styled.div`
  padding: 0.4rem 0;

  display: flex;
`;

const Col = styled.div`
  flex: ${(props: { size: number }) => props.size};
  display: flex;
  align-items: center;
`;

const FieldName = styled.div`
  white-space: nowrap;
`;

const NumberInputField = styled.input.attrs({
  type: "number",
})`
  width: 100%;
`;

const PinSection = styled.div`
  display: flex;
  margin-top: 1.5rem;
  max-width: 60%;
  gap: 1rem;
`;

const PinNameInput = styled.input`
  flex: 1;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  padding: 0.5rem;
  font-family: inherit;
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
  transition: all 0.2s ease;
  white-space: nowrap;

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
        <PinNameInput
          value={pinName}
          onChange={(e) => setPinName(e.target.value)}
          placeholder={PIN_NAME_PLACEHOLDER}
        />
        <PinButton
          onClick={() => {
            props.pinFormat(
              pinName.trim() || `Custom E${exponentWidth}M${significandWidth}`,
              exponentWidth,
              significandWidth
            );
            setPinName("");
          }}
        >
          {PIN_FORMAT_BUTTON_STRING}
        </PinButton>
      </PinSection>
      <FormatConverter
        name={props.name}
        exponentWidth={exponentWidth}
        significandWidth={significandWidth}
      />
    </Wrapper>
  );
};

export default CustomFormatConverter;
