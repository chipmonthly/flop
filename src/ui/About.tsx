import React, { FC, ReactElement } from "react";
import styled from "styled-components";

import {
  ACCENT_COLOR,
  APP_TITLE,
  BIGNUM_ACKNOWLEDGEMENT_TEXT,
  BIGNUM_ACKNOWLEDGEMENT_URL,
  BUILD_SOURCE_TEXT,
  BUILD_SOURCE_URL,
  ISSUES_CONTRIBUTION_TEXT,
  ISSUES_CONTRIBUTION_URL,
  UI_ACKNOWLEDGEMENT_TEXT,
  UI_ACKNOWLEDGEMENT_URL,
} from "../constants";

const Wrapper = styled.div`
  max-width: 45rem;
  margin: 0 auto;
  padding: 3rem 2rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin: 0;
  color: white;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.6rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  margin: 0;
  color: ${ACCENT_COLOR};
`;

const Text = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
`;

const Link = styled.a`
  color: ${ACCENT_COLOR};
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s ease;

  &:hover {
    text-decoration: underline;
    opacity: 0.9;
  }
`;

const VersionBadge = styled.div`
  display: inline-block;
  background: rgba(3, 156, 253, 0.15);
  border: 1px solid ${ACCENT_COLOR};
  color: ${ACCENT_COLOR};
  padding: 0.3rem 0.8rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 500;
  align-self: start;
`;

const About: FC = (): ReactElement => (
  <Wrapper>
    <Title>About Flop</Title>

    <Section>
      <SectionTitle>Application</SectionTitle>
      <Text>{APP_TITLE}</Text>
      <VersionBadge>
        {BUILD_SOURCE_TEXT.pre}
        <Link
          href={BUILD_SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit" }}
        >
          {BUILD_SOURCE_TEXT.link}
        </Link>
      </VersionBadge>
    </Section>

    <Section>
      <SectionTitle>Acknowledgements & References</SectionTitle>
      <Text>
        {UI_ACKNOWLEDGEMENT_TEXT.pre}
        <Link
          href={UI_ACKNOWLEDGEMENT_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {UI_ACKNOWLEDGEMENT_TEXT.link}
        </Link>
        {UI_ACKNOWLEDGEMENT_TEXT.post}
      </Text>
      <Text>
        {BIGNUM_ACKNOWLEDGEMENT_TEXT.pre}
        <Link
          href={BIGNUM_ACKNOWLEDGEMENT_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {BIGNUM_ACKNOWLEDGEMENT_TEXT.link}
        </Link>
        {BIGNUM_ACKNOWLEDGEMENT_TEXT.post}
      </Text>
    </Section>

    <Section>
      <SectionTitle>Open Source & Contributions</SectionTitle>
      <Text>
        {ISSUES_CONTRIBUTION_TEXT.pre}
        <Link
          href={ISSUES_CONTRIBUTION_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {ISSUES_CONTRIBUTION_TEXT.link}
        </Link>
        {ISSUES_CONTRIBUTION_TEXT.post}
      </Text>
    </Section>
  </Wrapper>
);

export default About;
