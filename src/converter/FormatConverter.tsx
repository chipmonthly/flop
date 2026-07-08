import React, { FC, ReactElement, useEffect, useRef, useState } from "react";
import styled from "styled-components";

import {
  DECIMAL_INPUT_STORAGE_KEY,
  FLOP_STORAGE_KEY,
  FLOP754_STORAGE_KEY,
  NOTATION_STORAGE_KEY,
  ROUNDING_MODE,
  ROUNDING_STORAGE_KEY,
} from "../constants";
import { useFormatHistory } from "../hooks/useFormatHistory";
import useLocalStorage from "../hooks/useLocalStorage";
import BitPanel from "./BitPanel";
import ConfigPanel from "./ConfigPanel";
import {
  calculateError,
  convertFlop754ToFlop,
  convertFlopToFlop754,
  deconstructFlop754,
  defaultFlop,
  defaultFlop754,
  deserializeFlop,
  deserializeFlop754,
  Flop,
  Flop754,
  generateFlop,
  generateFlop754,
  getExponent,
  getSignificand,
  isSubnormal,
  stringifyBits,
  stringifyBitsToHex,
  stringifyFlop,
} from "./flop";
import HistoryPanel from "./HistoryPanel";
import Panel from "./Panel";

const Wrapper = styled.div`
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.75rem;
`;

const Title = styled.h2`
  font-size: 1.6rem;
  margin: 0;
  color: white;
  font-weight: 600;
`;

const TwoColumnLayout = styled.div`
  display: flex;
  gap: 2rem;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const Column = styled.div<{ flex?: number }>`
  flex: ${(props) => props.flex || 1};
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

interface FormatConverterProps {
  name: string;
  exponentWidth: number;
  significandWidth: number;
  supportsInfinity?: boolean;
  supportsNaN?: boolean;
}

const safeStringifyFlop = (
  flop: Flop,
  scientific: boolean,
  supportsInfinity = true,
  supportsNaN = true
): string => {
  return stringifyFlop(flop, scientific);
};

const FormatConverter: FC<FormatConverterProps> = (
  props: FormatConverterProps
): ReactElement => {
  const initialLoad = useRef(true);
  const [flop, setFlop] = useLocalStorage<null | Flop>(
    `${props.name}${FLOP_STORAGE_KEY}`,
    null,
    deserializeFlop
  );
  const [flop754, setFlop754] = useLocalStorage(
    `${props.name}${FLOP754_STORAGE_KEY}`,
    defaultFlop754(props.exponentWidth),
    deserializeFlop754
  );
  const [roundingMode, setRoundingMode] = useLocalStorage(
    `${props.name}${ROUNDING_STORAGE_KEY}`,
    ROUNDING_MODE.halfToEven
  );
  const [scientificNotation, setScientificNotation] = useLocalStorage(
    `${props.name}${NOTATION_STORAGE_KEY}`,
    false
  );
  const [decimalInput, setDecimalInput] = useLocalStorage(
    `${props.name}${DECIMAL_INPUT_STORAGE_KEY}`,
    ""
  );
  const [storedFlop, setStoredFlop] = useState(defaultFlop());
  const [error, setError] = useState<null | Flop>(null);
  const { history, addEntry, clearHistory, deleteEntry } = useFormatHistory(
    props.name
  );

  const onFlop754Update = (value: Flop754) => {
    setFlop(null);
    setFlop754(value);
  };

  const onFlopUpdate = (value: Flop | null) => {
    setFlop(value);
  };

  const onRoundingModeUpdate = (roundingMode: ROUNDING_MODE) => {
    setRoundingMode(roundingMode);
  };

  const onNotationUpdate = (isScientific: boolean) => {
    setScientificNotation(isScientific);
  };

  useEffect(() => {
    setStoredFlop(convertFlop754ToFlop(flop754));
  }, [flop754]);

  useEffect(() => {
    if (flop !== null) {
      const updated754Value = convertFlopToFlop754(
        flop,
        props.exponentWidth,
        props.significandWidth,
        roundingMode,
        props.supportsInfinity !== false,
        props.supportsNaN !== false
      );
      setFlop754(updated754Value);
    }
  }, [
    flop,
    roundingMode,
    setFlop754,
    props.exponentWidth,
    props.significandWidth,
    props.supportsInfinity,
    props.supportsNaN,
  ]);

  useEffect(() => {
    setError(flop ? calculateError(flop, storedFlop) : null);
  }, [flop, storedFlop]);

  // clear states with values if component widths are set after initial load
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    setFlop(null);
    setFlop754(defaultFlop754(props.exponentWidth));
  }, [setFlop, setFlop754, props.exponentWidth, props.significandWidth]);

  const { sign, exponent, significand } = deconstructFlop754(
    flop754,
    props.exponentWidth,
    props.significandWidth
  );

  const handleAddCurrentToHistory = (): void => {
    const inputVal =
      decimalInput ||
      safeStringifyFlop(
        storedFlop,
        scientificNotation,
        props.supportsInfinity,
        props.supportsNaN
      );
    if (!inputVal) return;
    addEntry({
      decimalInput: inputVal,
      storedValue: safeStringifyFlop(
        storedFlop,
        scientificNotation,
        props.supportsInfinity,
        props.supportsNaN
      ),
      binaryRep: stringifyBits([sign, exponent, significand].flat()),
      hexRep: stringifyBitsToHex([sign, exponent, significand].flat()),
      error: error ? stringifyFlop(error, scientificNotation) : "0",
      sign: stringifyBits(sign),
      exponent: stringifyBits(exponent),
      mantissa: stringifyBits(significand),
    });
  };

  return (
    <Wrapper>
      <HeaderRow>
        <Title>{props.name}</Title>
      </HeaderRow>
      <BitPanel
        {...props}
        sign={sign}
        exponent={exponent}
        exponentValue={getExponent(flop754)}
        significand={significand}
        significandValue={
          (isSubnormal(flop754) ? "(subnormal) " : "") + getSignificand(flop754)
        }
        updateValue={(
          sign: boolean[],
          exponent: boolean[],
          significand: boolean[]
        ) =>
          onFlop754Update(
            generateFlop754(
              sign,
              exponent,
              significand,
              props.supportsInfinity !== false,
              props.supportsNaN !== false
            )
          )
        }
      />
      <TwoColumnLayout>
        <Column flex={3}>
          <Panel
            formatName={props.name}
            clearInput={flop === null}
            decimalInput={decimalInput}
            setDecimalInput={setDecimalInput}
            stored={safeStringifyFlop(
              storedFlop,
              scientificNotation,
              props.supportsInfinity,
              props.supportsNaN
            )}
            error={error ? stringifyFlop(error, scientificNotation) : ""}
            bits={[sign, exponent, significand].flat(1)}
            updateInputValue={(inputValue: string) =>
              onFlopUpdate(
                inputValue.length === 0 ? null : generateFlop(inputValue)
              )
            }
            updateValue={(bits: boolean[]) =>
              onFlop754Update(
                generateFlop754(
                  bits.slice(0, 1),
                  bits.slice(1, 1 + props.exponentWidth),
                  bits.slice(
                    1 + props.exponentWidth,
                    1 + props.exponentWidth + props.significandWidth
                  ),
                  props.supportsInfinity !== false,
                  props.supportsNaN !== false
                )
              )
            }
            onCommit={(inputValue: string) => {
              if (inputValue.length === 0) return;
              addEntry({
                decimalInput: inputValue,
                storedValue: safeStringifyFlop(
                  storedFlop,
                  scientificNotation,
                  props.supportsInfinity,
                  props.supportsNaN
                ),
                binaryRep: stringifyBits([sign, exponent, significand].flat()),
                hexRep: stringifyBitsToHex(
                  [sign, exponent, significand].flat()
                ),
                error: error ? stringifyFlop(error, scientificNotation) : "0",
                sign: stringifyBits(sign),
                exponent: stringifyBits(exponent),
                mantissa: stringifyBits(significand),
              });
            }}
          />
        </Column>
        <Column flex={2}>
          <ConfigPanel
            roundingMode={roundingMode}
            scientificNotation={scientificNotation}
            updateRoundingMode={onRoundingModeUpdate}
            updateNotation={onNotationUpdate}
          />
        </Column>
      </TwoColumnLayout>
      <HistoryPanel
        formatName={props.name}
        exponentWidth={props.exponentWidth}
        history={history}
        onSelect={(entry) => {
          setDecimalInput(entry.decimalInput);
          onFlopUpdate(generateFlop(entry.decimalInput));
        }}
        onClear={clearHistory}
        onAdd={handleAddCurrentToHistory}
        onDelete={deleteEntry}
      />
    </Wrapper>
  );
};

export default FormatConverter;
