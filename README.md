# custom-elements

[![Build Status](https://travis-ci.org/bash/custom-elements.svg?branch=master)](https://travis-ci.org/bash/custom-elements)
[![WTFPL License](https://img.shields.io/badge/license-WTFPL-blue.svg)](LICENSE)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![built-with-make](https://img.shields.io/badge/build%20system-make-brightgreen.svg)](Makefile)

a standalone polyfill for the custom elements v1 spec

🚧 **DISCLAIMER: THIS POLYFILL IS WORK IN PROGRESS. USE AT YOUR OWN RISK.** 🚧

## Download

A pre-built version can be found [here](https://github.com/bash/custom-elements/releases/latest)

## Polyfill extras

The polyfilled `CustomElementsRegistry` provides an additional property `polyfilled` set to `true`.

```js
// when natively supported
console.log(window.customElements.polyfilled) // => undefined

// when polyfilled
console.log(window.customElements.polyfilled) // => true
```


## Install Dependencies
```bash
make deps
```

## Building
```bash
make
```

## Building for production
Setting the `BUILD_ENV` environment variable to `production` will disable sourcmaps and cause the javascript to be minified.
It's generally a good idea to run `make clean` before building for production.

```bash
BUILD_ENV=release make
```

## Cleanup built files
```bash
make clean
```
