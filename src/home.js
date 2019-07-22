import React from "react";
import { Link } from "react-router-dom";
import { Heading, Text } from "@primer/components";

function Home() {
  return (
    <div>
      <Heading>Search GitHub repositories with regular expressions</Heading>
      <p>
        Like <code>git grep</code> but on the internet.
      </p>
      <p>
       Just replace "github.com" in a repository's URL with "grephub.com", and
       you're all set.
      </p>
      <p>
        For instance, to search lodash, go to <Link to="/lodash/lodash">grephub.com/lodash/lodash</Link>.
      </p>
    </div>
  );
}
export default Home;
