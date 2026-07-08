import React, { FC, ReactElement } from "react";
import styled from "styled-components";

import { ACCENT_COLOR, UNPIN_TOOLTIP_STRING } from "../constants";

const Wrapper = styled.nav`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem 1rem;
  gap: 0.35rem;

  @media (max-width: 768px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    padding: 0.5rem;
    gap: 0.3rem;
  }
`;

const TabButton = styled.button`
  padding: 0.45rem 0.75rem;
  font-size: 0.9rem;
  font-weight: 500;
  background-color: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.35rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  text-align: left;
  transition: all 0.15s ease;

  &:hover {
    color: white;
    border-color: rgba(255, 255, 255, 0.35);
    background-color: rgba(255, 255, 255, 0.04);
  }

  &.active {
    background-color: ${ACCENT_COLOR};
    color: white;
    border-color: ${ACCENT_COLOR};
  }

  @media (max-width: 768px) {
    width: auto;
    font-size: 0.8rem;
    padding: 0.3rem 0.5rem;
  }
`;

const RemoveButton = styled.span`
  margin-left: 0.5rem;
  font-size: 1.1rem;
  line-height: 1;
  opacity: 0.6;
  color: inherit;
  transition: opacity 0.2s ease, transform 0.2s ease;
  padding: 0 0.2rem;

  &:hover {
    opacity: 1;
    transform: scale(1.2);
  }
`;

interface TabBarProps {
  tabs: {
    name: string;
    urlPath: string;
    onRemove?: () => void;
  }[];
  activeTab: number;
  clickTab: (urlPath: string) => void;
}

const TabBar: FC<TabBarProps> = (props: TabBarProps): ReactElement => (
  <Wrapper>
    {props.tabs.map((e, i) => (
      <TabButton
        key={i}
        title={e.name}
        className={i === props.activeTab ? "active" : ""}
        onClick={() =>
          i !== props.activeTab ? props.clickTab(e.urlPath) : null
        }
      >
        <span>{e.name}</span>
        {e.onRemove && (
          <RemoveButton
            title={UNPIN_TOOLTIP_STRING}
            onClick={(evt) => {
              evt.stopPropagation();
              e.onRemove?.();
            }}
          >
            &times;
          </RemoveButton>
        )}
      </TabButton>
    ))}
  </Wrapper>
);

export default TabBar;
