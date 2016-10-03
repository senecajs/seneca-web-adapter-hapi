'use strict'

const Code = require('code')
const Lab = require('lab')
const Request = require('request')
const Seneca = require('seneca')
const Web = require('seneca-web')
const Hapi = require('hapi')

const expect = Code.expect
const lab = exports.lab = Lab.script()
const describe = lab.describe
const it = lab.it
const beforeEach = lab.beforeEach
const afterEach = lab.afterEach

describe('hapi', () => {
  let si = null
  let server = null

  beforeEach(done => {
    server = new Hapi.Server()
    si = Seneca({log: 'silent'})
    si.use(Web, {adapter: require('..'), context: server})
    server.connection({port: 3000})
    server.start(done)
  })

  afterEach(done => {
    server.stop(done)
  })

  it('by default routes autoreply', (done) => {
    var config = {
      routes: {
        pin: 'role:test,cmd:*',
        map: {
          ping: true
        }
      }
    }

    si.add('role:test,cmd:ping', (msg, reply) => {
      reply(null, {res: 'pong!'})
    })

    si.act('role:web', config, (err, reply) => {
      if (err) return done(err)

      Request('http://127.0.0.1:3000/ping', (err, res, body) => {
        if (err) return done(err)

        body = JSON.parse(body)

        expect(body).to.be.equal({res: 'pong!'})
        done()
      })
    })
  })

  it('multiple routes supported', (done) => {
    var config = {
      routes: {
        pin: 'role:test,cmd:*',
        map: {
          one: true,
          two: true
        }
      }
    }

    si.add('role:test,cmd:one', (msg, reply) => {
      reply(null, {res: 'pong!'})
    })

    si.add('role:test,cmd:two', (msg, reply) => {
      reply(null, {res: 'ping!'})
    })

    si.act('role:web', config, (err, reply) => {
      if (err) return done(err)

      Request('http://127.0.0.1:3000/one', (err, res, body) => {
        if (err) return done(err)

        body = JSON.parse(body)
        expect(body).to.be.equal({res: 'pong!'})

        Request('http://127.0.0.1:3000/two', (err, res, body) => {
          if (err) return done(err)

          body = JSON.parse(body)

          expect(body).to.be.equal({res: 'ping!'})
          done()
        })
      })
    })
  })

  it('passes errors back to caller', done => {
    var config = {
      routes: {
        pin: 'role:test,cmd:*',
        map: {
          boom: true
        }
      }
    }

    server.ext('onPreResponse', (request, reply) => {
      const err = request.response
      if (!err.isBoom) {
        return reply.continue()
      }
      reply({message: err.orig.message.replace('gate-executor: ', '')}).code(400)
    })

    si.add('role:test,cmd:boom', (msg, reply) => {
      reply(new Error('aw snap!'))
    })

    si.act('role:web', config, (err, reply) => {
      if (err) return done(err)

      Request('http://127.0.0.1:3000/boom', (err, res, body) => {
        if (err) return done(err)
        body = JSON.parse(body)
        expect(res.statusCode).to.equal(400)
        expect(body).to.be.equal({message: 'aw snap!'})
        done()
      })
    })
  })
})
