import React from "react";
import { Box, Link } from "@primer/react";
import colors from "primer-colors";
import styled from "styled-components";

const FileLink = styled(Link)`
  display: inline-block;
  font-weight: 500;
  margin-top: 20px;
  margin-bottom: 5px;
`;

const MatchesTable = styled.table`
  table-layout: fixed;
  width: 100%;
`;

function Matches({ repoUrl, branch, matches }) {
  const matchesByFile = groupMatches(matches || []);
  const matchRows = Object.keys(matchesByFile).map(file => {
    const fileUrl = `${repoUrl}/blob/${branch}/${file}`;
    return (
      <div key={file}>
        <FileLink href={fileUrl}>{file}</FileLink>
        <Box padding="3px 0" borderWidth="1px" borderStyle="solid" borderColor="border.default" borderRadius={2}>
          <MatchesTable>
            <tbody>
              {matchesByFile[file].map(m => (
                <MatchLine key={m.line_number} fileUrl={fileUrl} match={m} />
              ))}
            </tbody>
          </MatchesTable>
        </Box>
      </div>
    );
  });

  return <Box paddingBottom="20px"> {matchRows} </Box>;
}

const codeFont =
  "SFMono-Regular,Consolas,Liberation Mono,Menlo,Courier,monospace";

const MatchRow = styled.tr`
  &:hover {
    background: ${colors.gray[1]};
  }
`;

const LineNumber = styled.td`
  color: ${colors.gray[5]};
  font-family: ${codeFont};
  font-size: 12px;
  padding: 3px 10px;
  text-align: right;
  width: 50px;
  vertical-align: top;
`;

const MatchContent = styled.td`
  font-family: ${codeFont};
  font-size: 12px;
  padding: 3px 10px;
  white-space: pre-wrap;
  word-break: break-all;
`;

const MatchHightlight = styled.span`
  font-weight: 600;
  background: ${colors.yellow[2]};
`;

function MatchLine({ match, fileUrl }) {
  const lineUrl = `${fileUrl}#L${match.line_number}`;
  const content = (
    <span>
      <span>{match.line.slice(0, match.match_pos[0])}</span>
      <MatchHightlight>
        {match.line.slice(match.match_pos[0], match.match_pos[1])}
      </MatchHightlight>
      <span>{match.line.slice(match.match_pos[1])}</span>
    </span>
  );

  return (
    <MatchRow>
      <LineNumber>
        <Link href={lineUrl}>{match.line_number}</Link>
      </LineNumber>
      <MatchContent>{content}</MatchContent>
    </MatchRow>
  );
}

function groupMatches(matches) {
  return matches.reduce((groups, match) => {
    if (!groups[match.file]) {
      groups[match.file] = [];
    }

    groups[match.file].push(match);
    return groups;
  }, {});
}

export default Matches;
