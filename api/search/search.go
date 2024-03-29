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
	"unicode/utf8"
)

const maxResults = 5000

type searchOpts struct {
	repo          string
	branch        string
	regexQuery    *regexp.Regexp
	simpleQuery   string
	regex         bool
	caseSensitive bool
}

type searchResult struct {
	Matches           []searchMatch `json:"matches"`
	DurationMs        int64         `json:"duration_ms"`
	BytesScanned      int64         `json:"bytes_scanned"`
	TimedOut          bool          `json:"timed_out"`
	ReachedMaxResults bool          `json:"reached_max_results"`
}

type searchMatch struct {
	File       string `json:"file"`
	LineNumber int    `json:"line_number"`
	Line       string `json:"line"`
	MatchPos   []int  `json:"match_pos"`
}

func searchRepo(ctx context.Context, opts *searchOpts) (*searchResult, error) {
	result := &searchResult{
		Matches: []searchMatch{},
	}
	startTime := time.Now()

	repoStream, err := requestRepo(ctx, opts.repo, opts.branch)
	if err != nil {
		return nil, err
	}

	err = searchTgzStream(repoStream, opts, result)
	if err != nil {
		return nil, err
	}

	result.DurationMs = int64(time.Since(startTime) / time.Millisecond)

	return result, nil
}

func requestRepo(ctx context.Context, repo, branch string) (io.ReadCloser, error) {
	url := fmt.Sprintf("https://github.com/%s/archive/%s.tar.gz", repo, branch)
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

func searchTgzStream(stream io.ReadCloser, opts *searchOpts, result *searchResult) error {
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
		if err = searchFileStream(fileName, tarReader, opts, result); err != nil {
			return err
		}

		if result.ReachedMaxResults {
			break
		}
	}
	return nil
}

func searchFileStream(name string, reader io.Reader, opts *searchOpts, result *searchResult) error {
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

		matchPos := searchLine(lineStr, opts)
		if matchPos != nil {
			result.Matches = append(result.Matches, searchMatch{
				File:       name,
				LineNumber: lineNo,
				Line:       lineStr,
				MatchPos:   matchPos,
			})

			if len(result.Matches) >= maxResults {
				result.ReachedMaxResults = true
				break
			}
		}

		lineNo++

		if err == io.EOF {
			break
		}
	}

	return nil
}

func searchLine(line string, opts *searchOpts) []int {
	// Regex search
	if opts.regex {
		return locBytesToRunes(opts.regexQuery.FindStringIndex(line), line)
	}

	// Simple exact search
	if !opts.caseSensitive {
		line = strings.ToLower(line)
	}
	idx := strings.Index(line, opts.simpleQuery)
	if idx < 0 {
		return nil
	}
	return locBytesToRunes([]int{idx, idx + len(opts.simpleQuery)}, line)
}

// Convert the byte offsets to unicode character offsets
func locBytesToRunes(loc []int, s string) []int {
	if len(loc) != 2 {
		return nil
	}
	return []int{utf8.RuneCountInString(s[0:loc[0]]), utf8.RuneCountInString(s[0:loc[1]])}
}

func isTimeout(err error) bool {
	e, ok := err.(net.Error)
	return ok && e.Timeout()
}
