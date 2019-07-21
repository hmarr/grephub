package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"regexp"
	"time"

	"github.com/apex/gateway"
)

type searchResults struct {
	Results []searchResult `json:"results"`
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

func main() {
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
