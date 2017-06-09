'use strict'

const _ = require('lodash')

module.exports = function hapi (options, context, auth, routes, done) {
  const seneca = this

  if (!context) {
    return done(new Error('no context provided'))
  }

  const logger = seneca.log.hasOwnProperty(options.loglevel)
    ? seneca.log[options.loglevel]
    : () => {}

  _.each(routes, (route) => {
    logger(`Mounting ${route.methods.join(', ')}: ${route.path}`)

    if (!route.auth && !route.secure) {
      unsecuredRoute(seneca, context, route)
    }
    else if (route.auth) {
      authRoute(seneca, context, route)
    }
  })

  done(null, {routes: routes})
}


function handleRoute (seneca, request, reply, route) {
  const payload = {
    request$: request,
    response$: reply,
    args: {
      isAuthenticated: request.auth.isAuthenticated,
      body: request.payload,
      route: route,
      query: request.query,
      params: request.params,
      user: request.auth.credentials || null
    }
  }

  if (route.redirect) {
    return reply.redirect(route.redirect)
  }

  if (route.auth.pass) {
    return reply.redirect(route.auth.pass)
  }

  seneca.act(route.pattern, payload, (err, response) => {
    if (err) {
      return reply(err)
    }

    if (route.autoreply) {
      return reply(null, response)
    }
  })
}

function unsecuredRoute (seneca, context, route) {
  context.route({
    method: route.methods,
    path: route.path,
    handler: (request, reply) => {
      handleRoute(seneca, request, reply, route)
    }
  })
}

function authRoute (seneca, context, route) {
  context.route({
    method: route.methods,
    path: route.path,
    config: {
      auth: route.auth.strategy
    },
    handler: (request, reply) => {
      handleRoute(seneca, request, reply, route)
    }
  })
}
