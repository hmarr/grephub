## grephub

Search GitHub repositories with regexes. GrepHub is like `git grep`, but for every repository on GitHub.

Just replace "github.com" in a repository's URL with "grephub.com", and you're all set.

For instance, to search lodash, go to https://grephub.com/lodash/lodash.

### Caveats

- This is an experiment that may be shut off at any minute
- It doesn't use an index so it's kind of slow and it won't work well with large repositories
- Streaming the whole repository from GitHub for each query is a terrible idea for a variety of reasons

### Similar projects

The following projects all make it really fast to search specific set of repositories. They index the code in the repositories so your queries will be lightning-fast, but the downside is you need to know which repositories you want to search before searching them.

- [Hound](https://github.com/hound-search/hound)
- [Zoekt](https://github.com/google/zoekt)
- [Livegrep](https://github.com/livegrep/livegrep)

### Running locally

To run the frontend:

```
$ npm install
$ npm start
```

To run the backend function, make sure you have the Go toolchain installed, then run:

```
$ make build-functions
$ functions/search
```

