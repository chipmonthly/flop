import React, { FC, ReactElement } from "react";
import styled from "styled-components";

import { BACKGROUND_COLOR, UNPIN_TOOLTIP_STRING } from "../constants";

const Wrapper = styled.div`
  width: 100%;
  min-width: 50rem; // TODO: Handle this more elegantly
  padding: 1rem;
`;

const TabButton = styled.button`
  padding: 0.4rem 0.8rem;
  margin: 0.6rem;

  font-size: 1.4rem;
  font-weight: bold;
  background-color: transparent;
  color: white;
  border-style: solid;
  border-radius: 0.4rem;
  border-color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;

  &:hover,
  &.active {
    background-color: white;
    color: ${BACKGROUND_COLOR};
  }
`;

const RemoveButton = styled.span`
  margin-left: 0.6rem;
  font-size: 1.2rem;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
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
        {e.name}
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
