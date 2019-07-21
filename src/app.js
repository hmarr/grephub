import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Box, BaseStyles, Heading } from "@primer/components";
import { gray } from "primer-colors";
import styled from "styled-components";
import Home from "./home";
import Search from "./search/page";

const Container = styled.div`
  padding: 10px;
`;

const PageContainer = styled.div`
  padding-top: 15px;
`;

const SiteTitle = styled(Link)`
  color: #ffffff;
  text-decoration: none;
`;

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
