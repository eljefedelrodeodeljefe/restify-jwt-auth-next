'use strict'
const test = require('tape').test
const restify = require('restify')
var PORT = 3555
const intf = 'http://127.0.0.1'

const http = require('http')

const validToken = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqd3QtYXRoIiwiaWF0IjoxNDUyMTkxODc0LCJleHAiOjE0ODM3Mjc4NzQsImF1ZCI6Ind3dy5qd3QuYXV0aCIsInN1YiI6Imp3dEBqd2F0LmF1dGgiLCJKd3QiOiJBdXRoIn0.Z9bBTYzu0GR7W2LuEwI2dV5_vZxXQ_7bW0sL0hsu5wk`
const expiredToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqd3QtYXRoIiwiaWF0IjoxNDUyMTkxODc0LCJleHAiOjE0NTIwMTkwNzQsImF1ZCI6Ind3dy5qd3QuYXV0aCIsInN1YiI6Imp3dEBqd2F0LmF1dGgiLCJKd3QiOiJBdXRoIn0.flqKp58k9vjsdHzeGOZKXmIFL8YezjIbW8vbWKU8Ph0'

const decodedPayload = {
  "iss": "jwt-ath",
  "iat": 1452191874,
  "exp": 1483727874,
  "aud": "www.jwt.auth",
  "sub": "jwt@jwat.auth",
  "Jwt": "Auth"
}

const secret = 'jwtsecret'

function makeGetReq (token, port, cb) {
  // var postData = querystring.stringify({
  //   'msg' : 'Hello World!'
  // })

  var options = {
    hostname: 'localhost',
    port: port,
    path: '/jwttest',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
    }
  }

  var req = http.request(options, (res) => {

    res.setEncoding('utf8')
    res.on('data', (chunk) => {

    })
    res.on('end', () => {
      return cb(null, res)
    })
  })

  req.on('error', (e) => {
    if (e) {
      console.log(e)
      return cb(e)
    }
    return
  })

  // // write data to request body
  // req.write()
  req.end()
}


test('Can be required', function (t) {
  t.plan(1)
  let a = require('../index.js')
  let b = require('../lib/jwt-auth.js')
  t.deepEqual(a, b, 'require index works')
})

test('Allows API call w/ valid token, send 302 with invalid', function (t) {
  const SERVER = restify.createServer({})
  t.plan(2)
  let ja = require('../')

  let testObj = {testObj: 'testObj'}

  let options = {
    secret: secret
  }

  SERVER.use(ja(options))
  SERVER.get('/jwttest', function (req, res, next) {
    return res.json(testObj)
  })
  SERVER.listen(PORT, 'localhost', function () {
    makeGetReq(validToken, PORT, function(err, res) {
      if (err) {
        t.fail()
      }
      t.equal(res.statusCode, 200, 'Valid token return 200 and an object')
      // t.ok(res.body)
      // SERVER.close()
      makeGetReq(expiredToken, PORT, function (err, res) {
        if (err) {
          t.fail()
        }
        t.deepEqual(302, res.statusCode, 'Expired token return 302 prompting to /login')
        SERVER.close()
      })
    })
  })
})

test('Whitelist allows request to pass through', function (t) {
  const SERVER = restify.createServer({})
  t.plan(1)
  let ja = require('../')

  let testObj = {testObj: 'testObj'}

  let options = {
    secret: secret,
    blacklist: [],
    whitelist: ['/jwttest']
  }

  SERVER.use(ja(options))
  SERVER.get('/jwttest', function (req, res, next) {
    return res.json(testObj)
  })
  SERVER.listen(PORT, 'localhost', function () {
    makeGetReq(expiredToken, PORT, function(err, res) {
      if (err) {
        console.log(err)
        t.fail()
      }
      t.equal(res.statusCode, 200, 'Valid token return 200 and an object')
      // t.ok(res.body)
      SERVER.close()
    })
  })
})

test('Blacklist forces authentication', function (t) {
  const SERVER = restify.createServer({})
  t.plan(2)
  let ja = require('../')

  let testObj = {testObj: 'testObj'}

  let options = {
    secret: secret,
    blacklist: ['/jwttest'],
    whitelist: []
  }

  SERVER.use(ja(options))
  SERVER.get('/jwttest', function (req, res, next) {
    return res.json(testObj)
  })
  SERVER.listen(PORT, 'localhost', function () {
    makeGetReq(expiredToken, PORT, function(err, res) {
      if (err) {
        console.log(err)
        t.fail()
      }
      t.equal(res.statusCode, 302, 'Valid token return 302 and an object')
      // t.ok(res.body)
      makeGetReq(validToken, PORT, function (err, res) {
        if (err) {
          t.fail()
        }
        t.deepEqual(302, res.statusCode, 'Expired token return 302 prompting to /login')
        SERVER.close()
      })
    })
  })
})
