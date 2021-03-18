package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/apex/gateway"
)

type errorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

func respondJSON(w http.ResponseWriter, statusCode int, obj interface{}) {
	bytes, err := json.Marshal(obj)
	if err != nil {
		http.Error(w, `{"error": "internal_error", "message": "internal error"}`, 500)
		return
	}
	w.WriteHeader(statusCode)
	w.Write(bytes)
}

func searchHandler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	ctx, cancelFunc := context.WithTimeout(ctx, 9*time.Second)
	defer cancelFunc()

	repo := r.URL.Query().Get("repo")
	if repo == "" {
		respondJSON(w, 400, errorResponse{
			Error:   "invalid_parameter",
			Message: "Missing 'repo' parameter'",
		})
		return
	}

	opts := &searchOpts{repo: repo}

	branch := r.URL.Query().Get("branch")
	if branch == "" {
		respondJSON(w, 400, errorResponse{
			Error:   "invalid_parameter",
			Message: "Missing 'branch' parameter'",
		})
		return
	}
	opts.branch = branch

	query := r.URL.Query().Get("query")
	if query == "" {
		respondJSON(w, 400, errorResponse{
			Error:   "invalid_parameter",
			Message: "Query cannot be empty",
		})
		return
	}
	opts.simpleQuery = query

	regex, err := strconv.ParseBool(r.URL.Query().Get("regex"))
	if err != nil {
		respondJSON(w, 400, errorResponse{
			Error:   "invalid_parameter",
			Message: "Invalid regex value",
		})
		return
	}
	opts.regex = regex

	caseSensitive, err := strconv.ParseBool(r.URL.Query().Get("caseSensitive"))
	if err != nil {
		respondJSON(w, 400, errorResponse{
			Error:   "invalid_parameter",
			Message: "Invalid caseSensitive value",
		})
		return
	}
	opts.caseSensitive = caseSensitive
	if !caseSensitive {
		opts.simpleQuery = strings.ToLower(query)
	}

	if regex {
		if !caseSensitive {
			query = "(?i)" + query
		}

		queryRe, err := regexp.Compile(query)
		if err != nil {
			errMsg := strings.Split(err.Error(), ":")[1]
			respondJSON(w, 400, errorResponse{
				Error:   "invalid_query",
				Message: "Invalid query: " + errMsg,
			})
			return
		}
		opts.regexQuery = queryRe
	}

	result, err := searchRepo(ctx, opts)
	if err != nil {
		log.Println(err)
		respondJSON(w, 500, errorResponse{
			Error:   "search_error",
			Message: "Search failed for an unknown reason",
		})
		return
	}

	respondJSON(w, 200, result)
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
