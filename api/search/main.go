package main

import (
	"archive/tar"
	"bufio"
	"compress/gzip"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/apex/gateway"
)

type searchResults struct {
	Results []searchResult `json:"results"`
}

type searchResult struct {
	File       string `json:"file"`
	LineNumber int    `json:"line_number"`
	Line       string `json:"line"`
	MatchPos   []int  `json:"match_pos"`
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

func main() {
	//ctx := context.Background()
	//ctx, cancelFunc := context.WithTimeout(ctx, 12*time.Second)
	//defer cancelFunc()

	//repo := "dependabot/dependabot-core"
	//query := "describe"
	//if err := searchRepo(ctx, repo, query); err != nil {
	//    panic(err)
	//}

	mux := http.NewServeMux()
	mux.HandleFunc("/.netlify/functions/search", searchHandler)

	go func() {
		log.Fatal(http.ListenAndServe(":3001", mux))
	}()
	fmt.Println("http server listening on :3001")

	// First argument (addr) is ignored with lambda
	fmt.Println("booting lambda server")
	http.HandleFunc("/", searchHandler)
	log.Fatal(gateway.ListenAndServe("", nil))
}

func searchHandler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	ctx, cancelFunc := context.WithTimeout(ctx, 9*time.Second)
	defer cancelFunc()

	repo := r.URL.Query().Get("repo")
	if repo == "" {
		http.Error(w, "missing 'repo' parameter'", 400)
		return
	}

	query := r.URL.Query().Get("query")
	if query == "" {
		http.Error(w, "missing 'query' parameter'", 400)
		return
	}

	queryRe, err := regexp.Compile(query)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	results, err := searchRepo(ctx, repo, queryRe)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	searchResults := searchResults{Results: results}

	enc := json.NewEncoder(w)
	if err := enc.Encode(searchResults); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
}
