import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { theme, Box, BaseStyles, Heading } from "@primer/components";
import { gray } from "primer-colors";
import styled, { ThemeProvider } from "styled-components";
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
      <ThemeProvider theme={theme}>
        <BaseStyles>
          <Box bg={gray[9]}>
            <Container>
              <Heading fontSize={3} color="#ffffff">
                <SiteTitle to="/">GrepHub</SiteTitle>
              </Heading>
            </Container>
          </Box>
          <Container>
            <PageContainer>
              <Route path="/" exact component={Home} />
              <Route path="/:account/:repo" exact component={Search} />
            </PageContainer>
          </Container>
        </BaseStyles>
      </ThemeProvider>
    </Router>
  );
}

export default App;
