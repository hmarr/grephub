package main

import (
	"archive/tar"
	"bufio"
	"compress/gzip"
	"context"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"regexp"
	"strings"
	"time"
)

type searchResult struct {
	Matches      []searchMatch `json:"matches"`
	DurationMs   int64         `json:"duration"`
	BytesScanned int64         `json:"bytes_scanned"`
	TimedOut     bool          `json:"timed_out"`
}

type searchMatch struct {
	File       string `json:"file"`
	LineNumber int    `json:"line_number"`
	Line       string `json:"line"`
	MatchPos   []int  `json:"match_pos"`
}

func searchRepo(ctx context.Context, repo string, query *regexp.Regexp) (*searchResult, error) {
	result := &searchResult{
		Matches: []searchMatch{},
	}
	startTime := time.Now()

	repoStream, err := requestRepo(ctx, repo)
	if err != nil {
		return nil, err
	}

	err = searchTgzStream(repoStream, query, result)
	if err != nil {
		return nil, err
	}

	result.DurationMs = time.Since(startTime).Nanoseconds() / 1000

	return result, nil
}

func requestRepo(ctx context.Context, repo string) (io.ReadCloser, error) {
	url := fmt.Sprintf("https://github.com/%s/archive/master.tar.gz", repo)
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req = req.WithContext(ctx)

	client := &http.Client{}
	rsp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	return rsp.Body, err
}

func searchTgzStream(stream io.ReadCloser, query *regexp.Regexp, result *searchResult) error {
	zipReader, err := gzip.NewReader(stream)
	if err != nil {
		return err
	}

	tarReader := tar.NewReader(zipReader)
	for {
		header, err := tarReader.Next()

		if err == io.EOF {
			break
		}

		// If we get a timeout, return what we have so far
		if err != nil && isTimeout(err) {
			result.TimedOut = true
			return nil
		}

		if err != nil {
			return err
		}

		if header.Typeflag != tar.TypeReg {
			continue
		}

		fileName := strings.SplitN(header.Name, "/", 2)[1]
		if err = searchFileStream(fileName, tarReader, query, result); err != nil {
			return err
		}
	}
	return nil
}

func searchFileStream(name string, reader io.Reader, query *regexp.Regexp, result *searchResult) error {
	lineNo := 1
	bufReader := bufio.NewReader(reader)
	ignoreRest := false
	for {
		line, prefix, err := bufReader.ReadLine()

		// If we get a timeout, return what we have so far
		if err != nil && isTimeout(err) {
			log.Println("Timed out while reading response")
			result.TimedOut = true
			return nil
		}

		if err != nil && err != io.EOF {
			return err
		}

		// If we previously encountered a prefix, skip the remainder of the line
		if ignoreRest {
			ignoreRest = prefix
			continue
		}

		if prefix {
			ignoreRest = true
		}

		result.BytesScanned += int64(len(line))
		lineStr := string(line)

		matchIndex := query.FindStringIndex(lineStr)
		if matchIndex != nil {
			result.Matches = append(result.Matches, searchMatch{
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

	return nil
}

func isTimeout(err error) bool {
	e, ok := err.(net.Error)
	return ok && e.Timeout()
}
