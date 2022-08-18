import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { ThemeProvider, Box, BaseStyles, Heading } from "@primer/react";
import colors from "primer-colors";
import styled from "styled-components";
import Home from "./home";
import Search from "./search/page";

const Container = styled.div`
  padding: 10px;
`;

const PageContainer = styled.div`
  margin: 0 auto;
  max-width: 800px;
  padding-top: 15px;
`;

const SiteTitle = styled(Link)`
  color: #ffffff;
  margin-left: 5px;
  text-decoration: none;
`;

function App() {
  return (
    <Router>
      <ThemeProvider>
        <BaseStyles>
          <Box bg={colors.gray[9]}>
            <Container>
              <Heading fontSize={3} color="#ffffff">
                <SiteTitle to="/">GrepHub</SiteTitle>
              </Heading>
            </Container>
          </Box>
          <Container>
            <PageContainer>
              <Routes>
                <Route path="/" exact element={<Home />} />
                <Route path="/:account/:repo" element={<Search />} />
              </Routes>
            </PageContainer>
          </Container>
        </BaseStyles>
      </ThemeProvider>
    </Router>
  );
}

export default App;
