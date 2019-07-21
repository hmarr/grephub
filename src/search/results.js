import React from "react";
import { BorderBox, Box, Link } from "@primer/components";
import { yellow, gray } from "primer-colors";
import styled from "styled-components";
import Matches from "./matches";

const SearchInfo = styled.div`
  color: ${gray[5]};
  font-size: 13px;
  margin-top: 10px;
`;

const SecondaryInfo = styled.span`
  float: right;
`;

function Results({ repoUrl, results }) {
  return (
    <Box paddingBottom="20px">
      <SearchInfo>
        Found {(results.matches || []).length} results in {results.duration_ms}{" "}
        ms
        {results.timed_out && " (query timed out)"}
        <SecondaryInfo>
          Scanned {humaniseBytes(results.bytes_scanned)}
        </SecondaryInfo>
      </SearchInfo>
      <Matches repoUrl={repoUrl} matches={results.matches} />
    </Box>
  );
}

function humaniseBytes(bytes) {
  const divisor = 1000;
  if (bytes < divisor) {
    return `${bytes} B`;
  }

  const units = ["kB", "MB", "GB"];
  let unitIndex = -1;
  do {
    bytes /= divisor;
    ++unitIndex;
  } while (bytes >= divisor && unitIndex < units.length - 1);

  return bytes.toFixed(1) + " " + units[unitIndex];
}

export default Results;
