import React from "react";
import { BorderBox, Box, Link } from "@primer/components";
import { yellow, gray } from "primer-colors";
import styled from "styled-components";

const FileLink = styled(Link)`
  display: inline-block;
  font-weight: 500;
  margin-top: 20px;
  margin-bottom: 5px;
`;

const ResultsTable = styled.table`
  table-layout: fixed;
  width: 100%;
`;

function Results({ repoUrl, results }) {
  const resultsByFile = groupResults(results);
  const resultEntries = Object.keys(resultsByFile).map(file => {
    const fileUrl = `${repoUrl}/blob/master/${file}`;
    return (
      <div key={file}>
        <FileLink href={`${repoUrl}/blob/master/${file}`}>{file}</FileLink>
        <BorderBox padding="3px 0">
          <ResultsTable>
            <tbody>
              {resultsByFile[file].map(r => (
                <ResultLine key={r.line_number} fileUrl={fileUrl} result={r} />
              ))}
            </tbody>
          </ResultsTable>
        </BorderBox>
      </div>
    );
  });

  return <Box paddingBottom="20px">{resultEntries}</Box>;
}

const codeFont =
  "SFMono-Regular,Consolas,Liberation Mono,Menlo,Courier,monospace";

const ResultRow = styled.tr`
 &:hover {
  background: ${gray[1]};
 }
`;

const LineNumber = styled.td`
  color: ${gray[5]};
  font-family: ${codeFont};
  font-size: 12px;
  padding: 3px 10px;
  text-align: right;
  width: 50px;
  vertical-align: top;
`;

const ResultContent = styled.td`
  font-family: ${codeFont};
  font-size: 12px;
  padding: 3px 10px;
  word-break: break-all;
`;

const ResultHightlight = styled.span`
  font-weight: 600;
  background: ${yellow[2]};
`;

function ResultLine({ result, fileUrl }) {
  const lineUrl = `${fileUrl}#L${result.line_number}`;
  const content = (
    <span>
      <span>{result.line.slice(0, result.match_pos[0])}</span>
      <ResultHightlight>
        {result.line.slice(result.match_pos[0], result.match_pos[1])}
      </ResultHightlight>
      <span>{result.line.slice(result.match_pos[1])}</span>
    </span>
  );

  return (
    <ResultRow>
      <LineNumber>
        <Link href={lineUrl}>{result.line_number}</Link>
      </LineNumber>
      <ResultContent>{content}</ResultContent>
    </ResultRow>
  );
}

function groupResults(results) {
  return results.reduce((groups, result) => {
    if (!groups[result.file]) {
      groups[result.file] = [];
    }

    groups[result.file].push(result);
    return groups;
  }, {});
}

export default Results;
