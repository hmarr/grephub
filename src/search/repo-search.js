import React, { useState } from "react";
import queryString from "query-string"
import { Flash } from "@primer/components";
import SearchForm from "./form";
import Results from "./results";

function RepoSearch({ repo }) {
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const performSearch = async ({ query, regex, caseSensitive }) => {
    setIsSearching(true);
    setSearchResults(null);

    const qs = queryString.stringify({
      query,
      regex,
      caseSensitive,
      repo: repo.full_name,
    })
    const rsp = await fetch(`/.netlify/functions/search?${qs}`);
    setIsSearching(false);

    const body = await rsp.json();
    if (rsp.status === 200 ) {
      setError(null);
      setSearchResults(body);
    } else {
      setError(body);
    }
  };

  const repoUrl = `https://github.com/${repo.full_name}`
  return (
    <div>
      <SearchForm
        placeholder={`Search ${repo.full_name}`}
        active={!isSearching}
        onSubmit={performSearch}
      />
      {isSearching && <p>Searching...</p>}
      {searchResults && <Results repoUrl={repoUrl} results={searchResults} />}
      {error && <Flash mt="15px" scheme="red">{error.message}</Flash>}
    </div>
  );
}
export default RepoSearch;
