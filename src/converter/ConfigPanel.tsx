import React, { FC, ReactElement } from "react";
import styled from "styled-components";

import {
  ACCENT_COLOR,
  NOTATION_FIELD_NAME,
  ROUNDING_MODE,
  ROUNDING_MODE_FIELD_NAME,
} from "../constants";

const Wrapper = styled.div`
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.5rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

const ConfigSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FieldName = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.65);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 0.25rem;
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.25rem 0;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.85rem;
  cursor: pointer;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.8);

  &:hover {
    color: white;
  }
`;

const RadioButton = styled.input.attrs({ type: "radio" })`
  margin: 0;
  margin-top: 0.15rem;
  cursor: pointer;
  accent-color: ${ACCENT_COLOR};
`;

const SubText = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  display: block;
`;

interface ConfigPanelProps {
  roundingMode: ROUNDING_MODE;
  scientificNotation: boolean;
  updateRoundingMode: (mode: ROUNDING_MODE) => void;
  updateNotation: (isScientific: boolean) => void;
}

const ConfigPanel: FC<ConfigPanelProps> = (
  props: ConfigPanelProps
): ReactElement => {
  return (
    <Wrapper>
      {/* Rounding Mode */}
      <ConfigSection>
        <FieldName>{ROUNDING_MODE_FIELD_NAME}</FieldName>
        <OptionGroup>
          <RadioLabel>
            <RadioButton
              checked={props.roundingMode === ROUNDING_MODE.halfToEven}
              onChange={() =>
                props.updateRoundingMode(ROUNDING_MODE.halfToEven)
              }
            />
            <div>
              Nearest, Ties to Even
              <SubText>(IEEE 754 default)</SubText>
            </div>
          </RadioLabel>
          <RadioLabel>
            <RadioButton
              checked={props.roundingMode === ROUNDING_MODE.towardZero}
              onChange={() =>
                props.updateRoundingMode(ROUNDING_MODE.towardZero)
              }
            />
            <div>
              Toward 0<SubText>(truncation)</SubText>
            </div>
          </RadioLabel>
        </OptionGroup>
      </ConfigSection>

      {/* Result Notation */}
      <ConfigSection>
        <FieldName>{NOTATION_FIELD_NAME}</FieldName>
        <OptionGroup>
          <RadioLabel>
            <RadioButton
              checked={!props.scientificNotation}
              onChange={() => props.updateNotation(false)}
            />
            Regular
          </RadioLabel>
          <RadioLabel>
            <RadioButton
              checked={props.scientificNotation}
              onChange={() => props.updateNotation(true)}
            />
            Scientific
          </RadioLabel>
        </OptionGroup>
      </ConfigSection>
    </Wrapper>
  );
};

export default ConfigPanel;
