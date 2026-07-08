import React, { FC, ReactElement } from "react";
import { Link as RouterLink } from "react-router-dom";
import styled from "styled-components";

import { ACCENT_COLOR } from "../constants";

const Wrapper = styled.footer`
  padding: 1rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  margin-top: auto;
`;

const NavLink = styled(RouterLink)`
  color: ${ACCENT_COLOR};
  text-decoration: none;
  font-weight: 500;
  margin-left: 0.5rem;

  &:hover {
    text-decoration: underline;
  }
`;

const Footer: FC = (): ReactElement => (
  <Wrapper>
    <span>Version {process.env.REACT_APP_VERSION}</span>
    <NavLink to="/about">About & Credits</NavLink>
  </Wrapper>
);

export default Footer;
