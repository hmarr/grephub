import React from "react";
import styled from "styled-components";
import SearchForm from "../search/form"

function Search({ match }) {
  const { account, repo } = match.params;
  const performSearch = (query) => {
    alert(query);
  };
  return (
    <div style={{maxWidth: 800, margin: "0 auto"}}>
      <SearchForm
        placeholder={`Search ${account}/${repo}`}
        onSubmit={performSearch} />
    </div>
  );
}
export default Search;
