import React from "react";
import { Box } from "@primer/components";
import { gray } from "primer-colors";
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

const Divider = styled.hr`
  border: 1px solid ${gray[2]};
  border-bottom: none;
  margin: 15px 0;
`;

function Results({ repoUrl, branch, results }) {
  return (
    <Box paddingBottom="20px">
      <Divider />
      <SearchInfo>
        Found {(results.matches || []).length}{results.reached_max_results ? "+" : ""}{" "}
        results in {results.duration_ms} ms
        {results.timed_out && " (query timed out)"}
        <SecondaryInfo>
          Scanned {humaniseBytes(results.bytes_scanned)}
        </SecondaryInfo>
      </SearchInfo>
      <Matches repoUrl={repoUrl} branch={branch} matches={results.matches} />
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
