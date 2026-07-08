import BigNumber from "bignumber.js";
import React, { FC, ReactElement, useEffect, useMemo, useState } from "react";
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
} from "react-router-dom";
import styled from "styled-components";

import {
  BACKGROUND_COLOR,
  BIGNUMBER_DECIMAL_PLACES,
  CUSTOM,
  DEFAULT_FORMAT_INDEX,
  FORMATS,
  MAIN_FONT_FAMILY,
} from "./constants";
import CustomFormatConverter from "./converter/CustomFormatConverter";
import FormatConverter from "./converter/FormatConverter";
import { usePinnedFormats } from "./hooks/usePinnedFormats";
import About from "./ui/About";
import Footer from "./ui/Footer";
import Header from "./ui/Header";
import TabBar from "./ui/TabBar";

const LayoutContainer = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: ${BACKGROUND_COLOR};
  color: white;
  font-family: ${MAIN_FONT_FAMILY};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
    overflow: auto;
  }
`;

const Sidebar = styled.aside`
  width: 18rem;
  height: 100%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  background-color: rgba(0, 0, 0, 0.2);
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    overflow-y: visible;
  }
`;

const MainContent = styled.main`
  flex-grow: 1;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 2rem;

  @media (max-width: 768px) {
    height: auto;
    padding: 1rem;
    overflow-y: visible;
  }
`;

const App: FC = (): ReactElement => {
  const [active, setActive] = useState(DEFAULT_FORMAT_INDEX);
  const location = useLocation();
  const history = useHistory();
  const { pinnedFormats, pinFormat, unpinFormat } = usePinnedFormats();

  const tabs = useMemo(
    () => [
      ...FORMATS.map((f) => ({ ...f })),
      ...pinnedFormats.map((pf) => ({
        ...pf,
        onRemove: () => unpinFormat(pf.id),
      })),
      CUSTOM,
      {
        name: "About",
        urlPath: "/about",
        pageTitle: "About - IEEE 754-Style Floating-Point Converter",
      },
    ],
    [pinnedFormats, unpinFormat]
  );

  // configure bignumber.js library
  BigNumber.set({ DECIMAL_PLACES: BIGNUMBER_DECIMAL_PLACES });

  const onTabChange = (urlPath: string) => {
    history.push(urlPath);
  };

  useEffect(() => {
    const index = tabs.findIndex((e) => e.urlPath === location.pathname);
    if (index !== -1) {
      setActive(index);
      document.title = tabs[index].pageTitle;
    }
  }, [location, tabs]);

  return (
    <LayoutContainer>
      <Sidebar>
        <Header />
        <TabBar tabs={tabs} activeTab={active} clickTab={onTabChange} />
      </Sidebar>
      <MainContent>
        <Switch>
          {FORMATS.map((e, i) => (
            <Route key={i} path={e.urlPath}>
              <FormatConverter key={i} {...e} />
            </Route>
          ))}
          {pinnedFormats.map((pf) => (
            <Route key={pf.id} path={pf.urlPath}>
              <FormatConverter
                name={pf.name}
                exponentWidth={pf.exponentWidth}
                significandWidth={pf.significandWidth}
              />
            </Route>
          ))}
          <Route path={CUSTOM.urlPath}>
            <CustomFormatConverter {...CUSTOM} pinFormat={pinFormat} />
          </Route>
          <Route path="/about">
            <About />
          </Route>
          <Route path={"/"}>
            <Redirect to={FORMATS[DEFAULT_FORMAT_INDEX].urlPath} />
          </Route>
        </Switch>
        <Footer />
      </MainContent>
    </LayoutContainer>
  );
};

export default App;
