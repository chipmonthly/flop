import React, { FC, ReactElement } from "react";
import styled from "styled-components";

import { APP_TITLE } from "../constants";

const Wrapper = styled.header`
  padding: 1.5rem 1rem 0.5rem 1rem;
  text-align: left;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1rem;
    text-align: center;
  }
`;

const Title = styled.h1`
  font-size: 1.1rem;
  margin: 0;
  font-weight: 700;
  line-height: 1.4;
  color: white;
`;

const Header: FC = (): ReactElement => (
  <Wrapper>
    <Title>{APP_TITLE}</Title>
  </Wrapper>
);

export default Header;
