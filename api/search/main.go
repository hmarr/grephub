package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"time"

	"github.com/apex/gateway"
)

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

	result, err := searchRepo(ctx, repo, queryRe)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	enc := json.NewEncoder(w)
	if err := enc.Encode(result); err != nil {
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
