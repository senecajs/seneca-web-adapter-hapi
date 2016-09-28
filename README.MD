# Seneca Web Adapter Connect

[![Build Status][travis-badge]][travis-url]
[![Coverage Status][coveralls-badge]][coveralls-url]

This is an adapter for [seneca-web](https://github.com/senecajs/seneca-web/) using hapi.

## Installation

A peer dependency has been specified `seneca-web`
And of course `hapi` must be present for this to work at all.

```
npm install --save hapi
npm install --save seneca-web
npm install --save seneca-web-adapter-hapi
```

## Usage

Please refer to the seneca-web documentation on how to load routes.

You can require this module as the adapter when using the SenecaWeb plugin

```js
const Seneca = require('seneca')
const SenecaWeb = require('seneca-web')
const Hapi = require('hapi')
const seneca = Seneca()
seneca.use(SenecaWeb, {
  context: (() => {
    const server = new Hapi.Server()
    server.connection({port: 4000})
    return server
  })(),
  adapter: require('seneca-web-adapter-hapi')
})
seneca.ready(() => {
  const server = seneca.export('web/context')()
  server.start()
})
```

[travis-badge]: https://travis-ci.org/senecajs/seneca-web-adapter-hapi.svg?branch=master
[travis-url]: https://travis-ci.org/senecajs/seneca-web-adapter-hapi
[coveralls-badge]: https://coveralls.io/repos/github/senecajs/seneca-web-adapter-hapi/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/senecajs/seneca-web-adapter-hapi?branch=master
