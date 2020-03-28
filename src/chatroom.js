const express = require('express')
const session = require('express-session')
const path = require('path')
const fetch = require('node-fetch')
const router = express.Router()

router.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: false,
  cookie: { sameSite: 'none', secure: true }
}))

const allMessages = {}
router.use('/api/:room', (req, res, next) => {
  const jwtToken = req.headers.authorization.split(' ').pop()
  if (!jwtToken) {
    return res.status(403)
  }
  return fetch('https://js5.c0d3.com/auth/api/session', {
    headers: {
      Authorization: `Authorization ${jwtToken}`
    }
  }).then(r => r.json()).then(data => {
    if (!data.username) {
      return res.status(403)
    }
    req.user = data
    const roomName = req.params.room
    allMessages[roomName] = allMessages[roomName] || []
    next()
  })
})

router.post('/api/:room/messages', (req, res) => {
  allMessages[req.params.room].push({
    name: req.user.username,
    message: req.body.message
  })
  res.json(allMessages[req.params.room])
})

router.get('/api/:room/messages', (req, res) => {
  res.json(allMessages[req.params.room])
})

router.get('/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/chatroom.html'))
})

module.exports = router
