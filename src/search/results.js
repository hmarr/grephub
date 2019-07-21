import React from "react";
import { BorderBox, Box, Link } from "@primer/components";
import { gray } from "primer-colors";
import styled from "styled-components";

const FileLink = styled(Link)`
  display: inline-block;
  font-weight: 500;
  margin-top: 20px;
  margin-bottom: 5px;
`;

function Results({ repoUrl, results }) {
  const resultsByFile = groupResults(results);
  const resultEntries = Object.keys(resultsByFile).map(file => {
    const fileUrl = `${repoUrl}/blob/master/${file}`;
    return (
      <div key={file}>
        <FileLink href={`${repoUrl}/blob/master/${file}`}>{file}</FileLink>
        <BorderBox padding="3px 0">
          <table>
            <tbody>
              {resultsByFile[file].map(r => (
                <ResultLine key={r.line_number} fileUrl={fileUrl} result={r} />
              ))}
            </tbody>
          </table>
        </BorderBox>
      </div>
    );
  });

  return <Box paddingBottom="20px">{resultEntries}</Box>;
}

const codeFont =
  "SFMono-Regular,Consolas,Liberation Mono,Menlo,Courier,monospace";

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
`;

function ResultLine({ result, fileUrl }) {
  const lineUrl = `${fileUrl}#L${result.line_number}`;
  return (
    <tr>
      <LineNumber>
        <Link href={lineUrl}>
            {result.line_number}
        </Link>
      </LineNumber>
      <ResultContent>{result.line}</ResultContent>
    </tr>
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
