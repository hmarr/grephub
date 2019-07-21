import React, { useState } from "react";
import queryString from "query-string"
import SearchForm from "./form";
import Results from "./results";

function Search({ match }) {
  const { account, repo } = match.params;

  const [searchResults, setSearchResults] = useState([]);
  const performSearch = async searchQuery => {
    const query = queryString.stringify({
      query: searchQuery,
      repo: `${account}/${repo}`
    })
    const rsp = await fetch(`/.netlify/functions/search?${query}`);
    const body = await rsp.json();
    setSearchResults(body.results);
  };

  const repoUrl =
    "https://github.com/" +
    encodeURIComponent(account) +
    "/" +
    encodeURIComponent(repo);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <SearchForm
        placeholder={`Search ${account}/${repo}`}
        onSubmit={performSearch}
      />
      <Results repoUrl={repoUrl} results={searchResults} />
    </div>
  );
}
export default Search;
