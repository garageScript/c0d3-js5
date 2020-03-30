const jwt = require('jsonwebtoken')
const { getUser } = require('./userlist')
const middlewares = {}

middlewares.setUser = (req, res, next) => {
  if (req.session.username) {
    req.user = getUser(req.session.username)
  }

  const authToken = (req.headers.authorization || '').split(' ')
  if (authToken) {
    const data = jwt.decode(authToken.pop()) || {}
    if (data.username) {
      req.user = getUser(data.username)
    }
  }

  next()
}

module.exports = middlewares
