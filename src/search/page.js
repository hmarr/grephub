import React, { useState } from "react";
import queryString from "query-string"
import SearchForm from "./form";
import Results from "./results";

function SearchPage({ match }) {
  const { account, repo } = match.params;

  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const performSearch = async searchQuery => {
    setIsSearching(true);
    setSearchResults(null);

    const query = queryString.stringify({
      query: searchQuery,
      repo: `${account}/${repo}`
    })
    const rsp = await fetch(`/.netlify/functions/search?${query}`);
    const body = await rsp.json();

    setIsSearching(false);
    setSearchResults(body);
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
      {isSearching && <p>Searching...</p>}
      {searchResults && <Results repoUrl={repoUrl} results={searchResults} />}
    </div>
  );
}
export default SearchPage;
