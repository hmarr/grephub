const fs = require("fs");
const gunzip = require("gunzip-maybe")
const tarStream = require("tar-stream")
const split = require('split');

import fetch from 'isomorphic-unfetch';

const searchTarball = function(tgzStream, query, cb) {
  const results = [];

  const extract = tarStream.extract();
  extract.on('entry', (header, stream, next) => {
    let lineNumber = 1;
    stream.pipe(split()).
      on('data', line => {
        if (line.includes(query)) {
          results.push({
            file: header.name.split('/').slice(1).join('/'),
            lineNumber: lineNumber,
            line: line,
          });
        }
        lineNumber++;
      })

    stream.on('end', function() {
      next() // ready for next entry
    })

    stream.resume() // just auto drain the stream
  });

  extract.on('finish', () => cb(results));

  tgzStream.pipe(gunzip()).pipe(extract);
}

export default async (req, res) => {
  const { account, repo, query } = req.query;

  console.log(`search request, account=${account}, repo=${repo} query=${query}`);
  const url = `https://github.com/${account}/${repo}/archive/master.tar.gz`;
  const rsp = await fetch(url);
  searchTarball(rsp.body, query, results => {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ results }));
  });
};
