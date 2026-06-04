import React, { FC, ReactElement, useState } from "react";
import styled from "styled-components";

import {
  ACCENT_COLOR,
  BACKGROUND_COLOR,
  HISTORY_CLEAR_BUTTON_STRING,
  HISTORY_PANEL_TITLE,
  MONOSPACED_FONT_FAMILY,
} from "../constants";
import { HistoryEntry } from "../hooks/useFormatHistory";

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

const ListWrapper = styled.div`
  overflow-y: auto;
  max-height: 24rem;
  background-color: ${BACKGROUND_COLOR};
`;

const HistoryRow = styled.div`
  display: flex;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background-color 0.2s ease;
  align-items: center;
  justify-content: space-between;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(3, 156, 253, 0.1);
  }
`;

const RowMeta = styled.span`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
`;

const RowValue = styled.span`
  font-family: ${MONOSPACED_FONT_FAMILY};
  font-size: 0.9rem;
  color: white;
  word-break: break-all;
`;

const RowStored = styled.span`
  font-family: ${MONOSPACED_FONT_FAMILY};
  font-size: 0.9rem;
  color: ${ACCENT_COLOR};
  word-break: break-all;
  margin-left: 1rem;
  text-align: right;
`;

const EmptyText = styled.div`
  padding: 1.5rem;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  font-size: 0.9rem;
`;

interface HistoryPanelProps {
  formatName: string;
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}

const HistoryPanel: FC<HistoryPanelProps> = (
  props: HistoryPanelProps
): ReactElement => {
  const [expanded, setExpanded] = useState(true);

  const formatTime = (ts: number): string => {
    const date = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}`;
  };

  return (
    <PanelWrapper>
      <Header>
        <TitleToggle onClick={() => setExpanded(!expanded)}>
          {expanded ? "▼" : "▶"} {HISTORY_PANEL_TITLE} ({props.history.length})
        </TitleToggle>
        <Actions>
          <ActionButton
            disabled={props.history.length === 0}
            onClick={props.onClear}
          >
            {HISTORY_CLEAR_BUTTON_STRING}
          </ActionButton>
        </Actions>
      </Header>
      <CollapseContainer expanded={expanded}>
        <ListWrapper>
          {props.history.length === 0 ? (
            <EmptyText>No history yet</EmptyText>
          ) : (
            props.history.map((entry) => (
              <HistoryRow key={entry.id} onClick={() => props.onSelect(entry)}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.2rem",
                    flex: 1,
                  }}
                >
                  <RowMeta>{formatTime(entry.timestamp)}</RowMeta>
                  <RowValue>{entry.decimalInput}</RowValue>
                </div>
                <RowStored>{entry.storedValue}</RowStored>
              </HistoryRow>
            ))
          )}
        </ListWrapper>
      </CollapseContainer>
    </PanelWrapper>
  );
};

export default HistoryPanel;
