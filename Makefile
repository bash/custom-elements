SHELL := /bin/bash
PATH  := ./node_modules/.bin:$(PATH)

SOURCES := $(shell find src -name "*.js")
ROLLUP_CONFIG := .rollup.config.js

.PHONY: all clean lint deps

all: dist/custom-elements.js

clean:
	rm -rf dist/

deps:
	npm prune
	npm install

lint:
	standard src/**/*.js

dist/custom-elements.js: $(SOURCES)
	@mkdir -p $(@D)
	rollup -c $(ROLLUP_CONFIG) -o $@ src/custom-elements.js

