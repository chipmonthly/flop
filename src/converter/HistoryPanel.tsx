import React, { FC, ReactElement, useState } from "react";
import styled from "styled-components";

import {
  ACCENT_COLOR,
  BACKGROUND_COLOR,
  EXPORT_CSV_BUTTON_STRING,
  EXPORT_MD_BUTTON_STRING,
  HISTORY_CLEAR_BUTTON_STRING,
  HISTORY_PANEL_TITLE,
  MONOSPACED_FONT_FAMILY,
} from "../constants";
import { HistoryEntry } from "../hooks/useFormatHistory";
import { exportAsCSV, exportAsMarkdown } from "./exportHistory";

const PanelWrapper = styled.div`
  margin-top: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.4rem;
  overflow: hidden;
  text-align: left;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const TitleToggle = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;

  &:hover {
    color: ${ACCENT_COLOR};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.2rem;
  color: white;
  padding: 0.2rem 0.6rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${ACCENT_COLOR};
    color: ${ACCENT_COLOR};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const CollapseContainer = styled.div<{ expanded: boolean }>`
  max-height: ${(props) => (props.expanded ? "30rem" : "0")};
  transition: max-height 0.3s ease-out;
  overflow: hidden;
`;

const ScrollContainer = styled.div`
  overflow-x: auto;
  width: 100%;
`;

const HistoryGridHeader = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1.2fr 2.5fr 1.2fr 0.6fr 1.2fr 1.8fr 40px;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  font-weight: bold;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  align-items: center;
`;

const HistoryGridRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1.2fr 2.5fr 1.2fr 0.6fr 1.2fr 1.8fr 40px;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background-color 0.2s ease;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(3, 156, 253, 0.1);
  }
`;

const GridCell = styled.span`
  font-size: 0.85rem;
  color: white;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MonospaceCell = styled(GridCell)`
  font-family: ${MONOSPACED_FONT_FAMILY};
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  line-height: 1;
  transition: all 0.2s ease;
  border-radius: 0.2rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #ff4d4f;
    background-color: rgba(255, 77, 79, 0.1);
  }
`;

const ListWrapper = styled.div`
  overflow-y: auto;
  max-height: 24rem;
  background-color: ${BACKGROUND_COLOR};
`;

const EmptyText = styled.div`
  padding: 1.5rem;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  font-size: 0.9rem;
`;

interface HistoryPanelProps {
  formatName: string;
  exponentWidth: number;
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

const getEntrySign = (entry: HistoryEntry, exponentWidth: number): string => {
  if (entry.sign !== undefined) return entry.sign;
  return entry.binaryRep.charAt(0) || "";
};

const getEntryExponent = (
  entry: HistoryEntry,
  exponentWidth: number
): string => {
  if (entry.exponent !== undefined) return entry.exponent;
  return entry.binaryRep.slice(1, 1 + exponentWidth) || "";
};

const getEntryMantissa = (
  entry: HistoryEntry,
  exponentWidth: number
): string => {
  if (entry.mantissa !== undefined) return entry.mantissa;
  return entry.binaryRep.slice(1 + exponentWidth) || "";
};

const HistoryPanel: FC<HistoryPanelProps> = (
  props: HistoryPanelProps
): ReactElement => {
  const [expanded, setExpanded] = useState(true);

  const handleClear = (): void => {
    if (window.confirm("Are you sure you want to clear the history?")) {
      props.onClear();
    }
  };

  return (
    <PanelWrapper>
      <Header>
        <TitleToggle onClick={() => setExpanded(!expanded)}>
          {expanded ? "▼" : "▶"} {HISTORY_PANEL_TITLE} ({props.history.length})
        </TitleToggle>
        <Actions>
          <ActionButton onClick={props.onAdd}>Add</ActionButton>
          <ActionButton
            disabled={props.history.length === 0}
            onClick={handleClear}
          >
            {HISTORY_CLEAR_BUTTON_STRING}
          </ActionButton>
          <ActionButton
            disabled={props.history.length === 0}
            onClick={() =>
              exportAsMarkdown(
                props.formatName,
                props.history,
                props.exponentWidth
              )
            }
          >
            {EXPORT_MD_BUTTON_STRING}
          </ActionButton>
          <ActionButton
            disabled={props.history.length === 0}
            onClick={() =>
              exportAsCSV(props.formatName, props.history, props.exponentWidth)
            }
          >
            {EXPORT_CSV_BUTTON_STRING}
          </ActionButton>
        </Actions>
      </Header>
      <CollapseContainer expanded={expanded}>
        <ScrollContainer>
          {props.history.length === 0 ? (
            <EmptyText>No history yet</EmptyText>
          ) : (
            <div style={{ minWidth: "75rem" }}>
              <HistoryGridHeader>
                <GridCell>Decimal Input</GridCell>
                <GridCell>Value Stored</GridCell>
                <GridCell>Error</GridCell>
                <GridCell>Binary</GridCell>
                <GridCell>Hex</GridCell>
                <GridCell>Sign</GridCell>
                <GridCell>Exponent</GridCell>
                <GridCell>Mantissa</GridCell>
                <GridCell></GridCell>
              </HistoryGridHeader>
              <ListWrapper>
                {props.history.map((entry) => {
                  const signVal = getEntrySign(entry, props.exponentWidth);
                  const expVal = getEntryExponent(entry, props.exponentWidth);
                  const mantVal = getEntryMantissa(entry, props.exponentWidth);
                  return (
                    <HistoryGridRow
                      key={entry.id}
                      onClick={() => props.onSelect(entry)}
                    >
                      <GridCell title={entry.decimalInput}>
                        {entry.decimalInput}
                      </GridCell>
                      <MonospaceCell
                        title={entry.storedValue}
                        style={{ color: ACCENT_COLOR }}
                      >
                        {entry.storedValue}
                      </MonospaceCell>
                      <MonospaceCell title={entry.error || "0"}>
                        {entry.error || "0"}
                      </MonospaceCell>
                      <MonospaceCell title={entry.binaryRep}>
                        {entry.binaryRep}
                      </MonospaceCell>
                      <MonospaceCell title={`0x${entry.hexRep}`}>
                        0x{entry.hexRep}
                      </MonospaceCell>
                      <MonospaceCell title={signVal}>{signVal}</MonospaceCell>
                      <MonospaceCell title={expVal}>{expVal}</MonospaceCell>
                      <MonospaceCell title={mantVal}>{mantVal}</MonospaceCell>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <DeleteButton
                          title="Delete record"
                          onClick={(e) => {
                            e.stopPropagation();
                            props.onDelete(entry.id);
                          }}
                        >
                          &times;
                        </DeleteButton>
                      </div>
                    </HistoryGridRow>
                  );
                })}
              </ListWrapper>
            </div>
          )}
        </ScrollContainer>
      </CollapseContainer>
    </PanelWrapper>
  );
};

export default HistoryPanel;
