'use strict'
const jwt = require('jsonwebtoken')

module.exports = function jwtAuthMiddleware (opts) {
  const options = opts || {}
  options.whitelist = opts.whitelist || false
  options.blacklist = opts.blacklist || false
  options.handler = opts.handler || function (req, res, next) {
    return res.redirect('/login', next)
  }

  var middleware = function(req, res, next) {
    // if whitelist pass through anyhow
    if (options.whitelist && options.whitelist.indexOf(req.getPath()) !== -1) {
      next()
    }

    if (options.blacklist && options.blacklist.indexOf(req.getPath()) !== -1) {
      return options.handler(req, res, next)
    }

    // if request header, verify and decode it
    // if not valid anymore, push requestee to login again
    if (req.headers.authorization) {
      var parts = req.headers.authorization.split(' ')
      if (parts.length === 2) {
        let scheme = parts[0]
        let credentials = parts[1]

        if (scheme === 'Bearer') {

          jwt.verify(credentials, options.secret, function (err, decoded) {
            if (err) {
              return options.handler(req, res, next)
            }
            // attach to req object
            req['decoded'] = decoded
            return next() // suceess
          })
        } else {
          return next(new restify.InvalidCredentialsError('Format is Authorization: Bearer [token]'))
        }
      } else {
        return next(new restify.InvalidCredentialsError('Format is Authorization: Bearer [token]'))
      }
    } else {
      return options.handler(req, res, next)
    }
  }

  return middleware
}
