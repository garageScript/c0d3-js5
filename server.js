const express = require('express')
const session = require('express-session')
const { uuid } = require('uuidv4')
const locationRoute = require('./src/location')
const authRoute = require('./src/auth')
const commandRoute = require('./src/command')
const ocrRoute = require('./src/ocr')
const chatRoute = require('./src/chat')
const chatroomRoute = require('./src/chatroom')
const abtestRoute = require('./src/abtest')
const todoListRoute = require('./src/todoList')
const imggen = require('./src/imagegen')
const exampleRoute = require('./src/examples')
const assetExercise = require('./src/assetExercise')
const imageAnalysis = require('./src/imageAnalysis')
const logGen = require('./src/log')
const app = express()

app.set('trust proxy', true)
app.use(express.static('public'))
app.use(express.json({ limit: '50mb' }))

// DOCS about session
// resave:
//     If your store sets an expiration date on stored sessions, then you likely need resave: true.
// saveUninitialized:
//     Choosing false is useful for implementing login sessions,
//     reducing server storage usage,
//     or complying with laws that require permission before setting a cookie.
const FIVE_MINUTES = 1000 * 60 * 5
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: false,
  cookie: { sameSite: 'none', secure: true, maxAge: FIVE_MINUTES }
}))

app.use((req, res, next) => {
  const sid = uuid()
  const reqLogger = logGen(null, sid)
  req.log = reqLogger.log
  req.warn = reqLogger.warn
  req.error = reqLogger.error
  res.set('c0d3-debug-id', sid)
  next()
})
app.use('/assetExercise', assetExercise)
app.use('/imageAnalysis', imageAnalysis)
app.use('/location', locationRoute)
app.use('/auth', authRoute)
app.use('/commands', commandRoute)
app.use('/ocr', ocrRoute)
app.use('/chat', chatRoute)
app.use('/chatroom', chatroomRoute)
app.use('/imggen', imggen)
app.use('/abtest', abtestRoute)
app.use('/todoList', todoListRoute)
app.use('/examples', exampleRoute)

const requests = []
app.get('/jsFile', (req, res) => {
  res.json({
    total: requests.length, requests
  })
})
app.get('/jsFile.js', (req, res) => {
  const date = new Date()
  requests.unshift({
    method: req.method,
    time: date.toTimeString()
  })
  res.set('Cache-Control', 'max-age=50')
  res.set('Expires', '50')
  res.send('console.log(\'hello zach\')')
})

let server

const startServer = (port = 3020) => {
  return new Promise((resolve, reject) => {
    server = app.listen(port, function () {
      resolve(server)
    })
    server.on('error', (err) => {
      server.close(() => {
        reject(err)
      })
    })
  })
}

const stopServer = () => {
  return new Promise((resolve, reject) => {
    server.close(resolve)
  })
}

module.exports = {
  startServer, stopServer
}
