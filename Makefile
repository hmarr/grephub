build-all: build-functions build-site

build-functions:
	mkdir -p functions
	cd api/search && go get && go build -o ../../functions/search ./...

build-site:
	yarn build
