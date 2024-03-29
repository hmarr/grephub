import React, { useState, useEffect } from "react";
import queryString from "query-string"
import RepoSearch from "./repo-search";
import { useParams } from "react-router-dom";

function SearchPage() {
  const { account, repo } = useParams();
  const query = queryString.parse(window.location.search);
  const initialQuery = query["q"];

  const [repoDetails, setRepoDetails] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchRepo = async () => {
      const url = `https://api.github.com/repos/${account}/${repo}`;

      let response;
      try {
        response = await fetch(url);
      } catch (err) {
        setError("Failed to fetch repository details from GitHub");
        return;
      }

      switch (response.status) {
        case 200:
          break;
        case 404:
          setError(`It seems like "${account}/${repo}" doesn't exist`);
          return;
        default:
          setError("Something went wrong, sorry!");
          return;
      }

      const data = await response.json();
      setRepoDetails(data);
    };

    fetchRepo();
  }, [account, repo]);

  return (
    <div>
      {repoDetails ? (
        <RepoSearch repo={repoDetails} initialQuery={initialQuery} />
      ) : error ? (
        error
      ) : (
        "Loading..."
      )}
    </div>
  );
}
export default SearchPage;
