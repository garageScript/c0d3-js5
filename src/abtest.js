const express = require('express')
const session = require('express-session')
const path = require('path')
const { uuid } = require('uuidv4')
const router = express.Router()

const colorSelections = {}
router.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { sameSite: 'none', secure: true }
}))

router.use('*', (req, res, next) => {
  if (!req.session.uid) {
    const guid = uuid()
    req.session.uid = guid
    colorSelections[guid] = 'red'
  }
  req.user = {
    color: colorSelections[req.session.uid]
  }
  next()
})

router.get('/api/usercolors', (req, res) => {
  res.json(colorSelections)
})

router.get('/', (req, res) => {
  res.send(`
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/andybrewer/mvp/mvp.css"></link>
  <style>
  * {
   color: ${req.user.color};
  }
  </style>
  <main>
  <h1>AB Testing</h1>
  <p>Cookie guid: ${req.session.uid}</p>
  <p>This page teaches you about AB Testing.</p>
  <p>Get your guid id above, and head to the admin page</p>
  <p><a href="/abtest/admin" target="__blank">Admin Page</a></p>
  <p>From the admin page, specify which color you want users to see, then come back and refresh this page!</p>
  <p>Usually in production, companies will segment a percentage of their users to see new features first.</p>
  <p>Then ramp up the testing to 100%</p>
  </main>
  `)
})

router.post('/api/usercolors', (req, res) => {
  if (req.body.username) {
    colorSelections[req.body.username] = req.body.value
  }
  res.json(colorSelections)
})

router.get('/admin', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/abtest.html'))
})

module.exports = router
