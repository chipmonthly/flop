import React, { FC, ReactElement } from "react";
import styled from "styled-components";

import { MONOSPACED_FONT_FAMILY } from "../constants";

const Wrapper = styled.div`
  box-sizing: border-box;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: fit-content;
  border-right: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-right: none;
  }
`;

const Title = styled.h4`
  margin: 0 0 0.4rem 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ValueField = styled.p`
  margin: 0 0 0.2rem 0;
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
`;

const DecimalField = styled.p`
  margin: 0 0 0.6rem 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.45);
  font-family: ${MONOSPACED_FONT_FAMILY};
`;

const BitField = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  justify-content: center;
`;

const BitCheckbox = styled.input`
  cursor: pointer;
  width: 1.1rem;
  height: 1.1rem;
  margin: 0;
`;

interface SegmentProps {
  name: string;
  value: string | ReactElement;
  decimal: string;
  bits: boolean[];
  updateBits: (bits: boolean[]) => void;
}

const BitSegment: FC<SegmentProps> = (props: SegmentProps): ReactElement => (
  <Wrapper>
    <Title>{props.name}</Title>
    <ValueField>{props.value}</ValueField>
    <DecimalField>{props.decimal}</DecimalField>
    <BitField>
      {[...props.bits].map((e, i) => (
        <BitCheckbox
          key={i}
          type="checkbox"
          checked={e}
          onChange={() =>
            props.updateBits([
              ...props.bits.slice(0, i),
              !props.bits[i],
              ...props.bits.slice(i + 1),
            ])
          }
        />
      ))}
    </BitField>
  </Wrapper>
);

export default BitSegment;
