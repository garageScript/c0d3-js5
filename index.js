const express = require('express')
const session = require('express-session')
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
const app = express()
const assetExercise = require('./src/assetExercise')

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

app.use('/assetExercise', assetExercise)
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
  res.set('Cache-Control', 'max-age=5')
  res.send('console.log(\'hello zach\')')
})

app.listen(process.env.PORT || 3020)
