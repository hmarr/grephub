package main

import (
	"archive/tar"
	"bufio"
	"compress/gzip"
	"context"
	"io"
	"regexp"
	"strings"
)

type searchResult struct {
	File       string `json:"file"`
	LineNumber int    `json:"line_number"`
	Line       string `json:"line"`
	MatchPos   []int  `json:"match_pos"`
}

func searchTgzStream(stream io.ReadCloser, query *regexp.Regexp) ([]searchResult, error) {
	zipReader, err := gzip.NewReader(stream)
	if err != nil {
		return nil, err
	}

	results := []searchResult{}
	tarReader := tar.NewReader(zipReader)
	for {
		header, err := tarReader.Next()

		if err == io.EOF {
			break
		}

		if err != nil {
			return nil, err
		}

		if header.Typeflag != tar.TypeReg {
			continue
		}

		fileName := strings.SplitN(header.Name, "/", 2)[1]
		fileResults, err := searchFileStream(fileName, tarReader, query)
		if err != nil {
			return nil, err
		}
		results = append(results, fileResults...)
	}
	return results, nil
}

func searchFileStream(name string, reader io.Reader, query *regexp.Regexp) ([]searchResult, error) {
	results := []searchResult{}
	lineNo := 1
	bufReader := bufio.NewReader(reader)
	ignoreRest := false
	for {
		line, prefix, err := bufReader.ReadLine()
		if err != nil && err != io.EOF {
			return nil, err
		}

		// If we previously encountered a prefix, skip the remainder of the line
		if ignoreRest {
			ignoreRest = prefix
			continue
		}

		if prefix {
			ignoreRest = true
		}

		lineStr := string(line)

		matchIndex := query.FindStringIndex(lineStr)
		if matchIndex != nil {
			results = append(results, searchResult{
				File:       name,
				LineNumber: lineNo,
				Line:       lineStr,
				MatchPos:   matchIndex,
			})
		}

		lineNo++

		if err == io.EOF {
			break
		}
	}

	return results, nil
}

func searchRepo(ctx context.Context, repo string, query *regexp.Regexp) ([]searchResult, error) {
	repoStream, err := requestRepo(ctx, repo)
	if err != nil {
		return nil, err
	}

	return searchTgzStream(repoStream, query)
}
