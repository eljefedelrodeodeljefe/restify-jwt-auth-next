# restify-jwt-auth-next

Lightweight JWT middleware for restify.

[![build status](https://secure.travis-ci.org/eljefedelrodeodeljefe/restify-jwt-auth-next.svg)](http://travis-ci.org/eljefedelrodeodeljefe/restify-jwt-auth-next) [![Coverage Status](https://coveralls.io/repos/eljefedelrodeodeljefe/restify-jwt-auth-next/badge.svg?branch=master&service=github)](https://coveralls.io/github/eljefedelrodeodeljefe/restify-jwt-auth-next?branch=master)
## Installation

```
npm install --save restify-jwt-auth-next
```

## Usage

```js
const restify = require('restify')
const jwtAuth = require('restify-jwt-auth-next')

var restify = restify.createServer({

let handler = function (req, res, next) {
  return res.redirect('/login', next)
}

let options = {
  secret: 'jwtsecret',
  blacklist: [], // blacklist routes like '/noaccess'
  whitelist: [], // whitelist routes like '/immediate'
  handler: handler // default is redirect as above. Will send a 302 and the login route
}

server.use(jwtAuth(options))

// protected route
server.get('/jwttest', function (req, res, next) {
  let testObj = {testObj: 'testObj'}
  return res.json(testObj)
})

server.listen(3000, 'localhost', function () {

})
```

## Credits
[Robert Jefe Lindstaedt](https://github.com/eljefedelrodeodeljefe/)

## License

MIT
