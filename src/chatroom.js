const express = require('express')
const path = require('path')
const fetch = require('node-fetch')
const router = express.Router()

const allMessages = {}
router.use('/api/*', (req, res, next) => {
  const jwtToken = (req.headers.authorization || '').split(' ').pop()
  if (!jwtToken) {
    return res.status(403).json({ error: { message: 'Not Logged In' } })
  }
  return fetch('https://js5.c0d3.com/auth/api/session', {
    headers: {
      Authorization: `Authorization ${jwtToken}`
    }
  }).then(r => r.json()).then(data => {
    if (!data.username) {
      return res.status(403).json({ error: { message: 'Not Logged In' } })
    }
    req.user = data
    next()
  })
})

router.get('/api/session', (req, res) => {
  res.json(req.user)
})

router.post('/api/:room/messages', (req, res) => {
  const roomName = req.params.room
  allMessages[roomName] = allMessages[roomName] || []
  allMessages[req.params.room].unshift({
    name: req.user.username,
    message: req.body.message
  })
  res.json(allMessages[req.params.room])
})

router.get('/api/:room/messages', (req, res) => {
  const roomName = req.params.room
  allMessages[roomName] = allMessages[roomName] || []
  res.json(allMessages[roomName])
})

router.get('/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/chatroom.html'))
})

module.exports = router
