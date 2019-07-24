import React, { useState, useEffect } from "react";
import RepoSearch from "./repo-search";

function SearchPage({ match }) {
  const { account, repo } = match.params;

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
        <RepoSearch repo={repoDetails} />
      ) : error ? (
        error
      ) : (
        "Loading..."
      )}
    </div>
  );
}
export default SearchPage;
