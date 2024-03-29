import React from "react";
import { Link } from "react-router-dom";
import { Heading, Text } from "@primer/react";
import styled from "styled-components";

const Divider = styled('hr')`
  border: none;
  height: 1px;
  background: #dddddd;
  margin: 2em 0;
`;


function Home() {
  return (
    <div>
      <Heading fontSize={4}>Search GitHub repositories with regexes</Heading>
      <p>
        GrepHub is like <code>git grep</code>, but for every repository on
        GitHub.
      </p>
      <p>
        Just replace "github.com" in a repository's URL with "grephub.hmarr.dev", and
        you're all set.
      </p>
      <p>
        For instance, to search lodash, go to{" "}
        <Link to="/lodash/lodash">grephub.hmarr.dev/lodash/lodash</Link>.
      </p>

      <Heading fontSize={3}>Caveats</Heading>
      <ul>
        <li>This is an experiment that may be shut off at any minute</li>
        <li>
          It doesn't use an index so it's kind of slow and it won't work well
          with large repositories
        </li>
        <li>
          Streaming the whole repository from GitHub for each query is a
          terrible idea for a variety of reasons
        </li>
      </ul>

      <Heading fontSize={3}>Similar projects</Heading>
      <p>
        The following projects all make it really fast to search specific set of
        repositories. They index the code in the repositories so your queries
        will be lightning-fast, but the downside is you need to know which
        repositories you want to search before searching them.
      </p>
      <ul>
        <li>
          <a href="https://github.com/hound-search/hound">Hound</a>
        </li>
        <li>
          <a href="https://github.com/google/zoekt">Zoekt</a>
        </li>
        <li>
          <a href="https://github.com/livegrep/livegrep">Livegrep</a>
        </li>
      </ul>
      <Divider />
      <Text color="grayLight">
        Built by <a href="https://hmarr.com">@hmarr</a>.
        Source available on <a href="https://github.com/hmarr/grephub">GitHub</a>.
      </Text>
    </div>
  );
}
export default Home;
