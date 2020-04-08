const express = require('express')
const fs = require('fs')
const router = express.Router()

const browserHTML = (browser = 'Unknown') => {
  let color = '#aaa'
  if (browser === 'firefox') {
    color = '#a22'
  }
  if (browser === 'chrome') {
    color = '#22a'
  }
  if (browser === 'safari') {
    color = '#2a2'
  }
  return `
  <style>
  h1 {
  color: ${color};
  }
  </style>
  <h1>Welcome ${browser} user</h1>
  `
}

router.get('/browser', async (req, res) => {
  const ua = req.get('user-agent').toLowerCase()
  if (ua.includes('firefox/')) {
    return res.send(browserHTML('firefox'))
  }
  if (ua.includes('chrome/')) {
    return res.send(browserHTML('chrome'))
  }
  if (ua.includes('safari/')) {
    return res.send(browserHTML('safari'))
  }
  return res.send(browserHTML())
})

let visitorCount = 0
router.get('/count', async (req, res) => {
  visitorCount = visitorCount + 1
  return res.send(`
  <h1>Welcome, this page has been visited ${visitorCount} times</h1>
  `)
})

router.get('/delay', async (req, res) => {
  setTimeout(() => {
    return res.send(`
    <h1>Your request has been delayed by 5 seconds</h1>
  `)
  }, 5000)
})

router.get('/getfile', async (req, res) => {
  fs.readFile('./hello', (err, data) => {
    if (err) return res.status(500).send('Error: Error reading file')
    res.send(`
    <div>${data}</div>
    `)
  })
})

module.exports = router
