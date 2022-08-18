import React, { useEffect, useState, useCallback } from "react";
import queryString from "query-string"
import { Flash } from "@primer/react";
import SearchForm from "./form";
import Results from "./results";

function RepoSearch({ repo, initialQuery }) {
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  const performSearch = useCallback(async ({ query, regex, caseSensitive }) => {
    setIsSearching(true);
    setSearchResults(null);

    const qs = queryString.stringify({
      query,
      regex,
      caseSensitive,
      repo: repo.full_name,
      branch: repo.default_branch
    })
    const rsp = await fetch(`/.netlify/functions/search?${qs}`);
    setIsSearching(false);

    const body = await rsp.json();
    if (rsp.status === 200) {
      setError(null);
      setSearchResults(body);
    } else {
      setError(body);
    }
  }, [repo.full_name, repo.default_branch]);

  // Search immediately if the ?q= query string is populated
  useEffect(() => {
    if (initialQuery) {
      performSearch({ query: initialQuery, regex: true, caseSensitive: false });
    }
  }, [initialQuery, performSearch]);

  const repoUrl = `https://github.com/${repo.full_name}`
  return (
    <div>
      <SearchForm
        placeholder={`Search ${repo.full_name}`}
        active={!isSearching}
        onSubmit={performSearch}
        initialQuery={initialQuery}
      />
      {isSearching && <p>Searching...</p>}
      {searchResults && <Results repoUrl={repoUrl} branch={repo.default_branch} results={searchResults} />}
      {error && <Flash mt="15px" scheme="red">{error.message}</Flash>}
    </div>
  );
}
export default RepoSearch;
