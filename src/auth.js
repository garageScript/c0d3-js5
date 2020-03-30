const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { uuid } = require('uuidv4')
const { getData, setData } = require('./db')
const router = express.Router()

const privateSecret = 'reallygreatc0der'

// For CORS. Must be placed at the top so this handles
// cors request first before propagating to other middlewares
// Credentials - https://stackoverflow.com/questions/24687313/what-exactly-does-the-access-control-allow-credentials-header-do
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Methods', 'GET', 'PUT, POST') // cors preflight
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Credentials'
  )
  next()
})

const SALT_ROUNDS = 10

let usernameList = {}
const emailMapping = {}
getData('userList').then((data) => {
  usernameList = data || {}
  Object.values(usernameList).forEach(user => {
    emailMapping[user.email] = user
  })
})

router.use('/*', (req, res, next) => {
  if (req.session.username) {
    req.user = usernameList[req.session.username]
  }
  const authToken = (req.headers.authorization || '').split(' ')
  if (authToken) {
    const data = jwt.decode(authToken.pop()) || {}
    if (data.username) {
      req.user = usernameList[data.username]
    }
  }

  const sendJson = res.json.bind(res)
  res.json = (...args) => {
    const newData = { ...args[0] }
    delete newData.password
    args[0] = newData
    sendJson(...args)
  }
  res.errJSON = (message) => {
    sendJson({
      error: {
        message
      }
    })
  }
  next()
})

const saveUser = (userInfo) => {
  usernameList[userInfo.username] = userInfo
  emailMapping[userInfo.email] = userInfo
  setData('userList', usernameList)
}

router.post('/api/users', (req, res) => {
  const userInfo = { ...req.body, id: uuid() }
  if (!userInfo.password || userInfo.password.length < 3) {
    return res.status(400).errJSON('Password too short. Please make it > 5 characters')
  }
  if (!userInfo.username || userInfo.username === ' ') {
    return res.status(400).errJSON('Username cannot be blank and must contain alpha numeric characters')
  }
  if (usernameList[userInfo.username]) {
    return res.status(400).errJSON('Username is taken, please pick another')
  }
  if (emailMapping[userInfo.email]) {
    return res.status(400).errJSON('Email is taken, please pick another')
  }
  const tmpPassword = Buffer.from(userInfo.password, 'base64').toString()
  bcrypt.hash(tmpPassword, SALT_ROUNDS, (err, hash) => {
    if (err) {
      return res.status(500).errJSON('Error has occurred in the server. Please try again at a later time')
    }
    userInfo.password = hash
    saveUser(userInfo)
    userInfo.jwt = jwt.sign({ username: userInfo.username }, privateSecret)
    req.session.username = userInfo.username
    res.json(userInfo)
  })
})

router.get('/api/users', (req, res) => {
  res.json({ users: Object.values(emailMapping) })
})

router.get('/api/session', (req, res) => {
  if (!req.user) {
    return res.status(403).errJSON('Not logged in')
  }
  return res.json(req.user)
})

router.post('/api/session', (req, res) => {
  const userInfo = { ...req.body }
  const identity = usernameList[userInfo.username]
  if (!identity) {
    return res.status(400).errJSON('User not found')
  }
  const tmpPassword = Buffer.from(userInfo.password, 'base64').toString()
  bcrypt.compare(tmpPassword, identity.password, (err, result) => {
    if (err) {
      return res.status(500).errJSON('Error has occurred in the server. Please try again at a later time')
    }
    if (!result) {
      return res.status(400).errJSON('Wrong credentials')
    }
    req.session.username = identity.username
    identity.jwt = jwt.sign({ username: identity.username }, privateSecret)
    return res.json(identity)
  })
})

router.get('/api/logout', (req, res) => {
  req.session.username = ''
  res.json({})
})

router.get('/', (req, res) => {
  res.send(`
  <script src="/auth.js"></script>
<h1>Authentication</h1>
<p>This section goes over authentication. You will be using this app to power the authentication for all your apps.</p>
<p>To test these out, simply open your console and try them out the functions</p>
<hr />
<h1>SDK</h1>
<p>
Your SDK should provide the following:
</p>

<h3>Script URL</h3>
<p>Developers should be able to easily add the JavaScript from your website.</p>
  <pre>
    &lt;script src="https://js5.c0d3.com/auth.js"&gt;&lt;/script&gt;
  </pre>

<h3>Signup Function</h3>
  <pre>
Auth.signup({
  username: 'songz',
  email: 'song@zheng.club',
  password: 'helpless',
  name: 'aouo oauu',
  age: 942,
  ... any key / value pairs you like ...
})
  </pre>

<h3>Login Function</h3>
  <pre>
Auth.login({
  username: 'songz',
  password: 'helpless',
})
  </pre>

<h3>Session Function</h3>
  <pre>
Auth.getSession().then( user => {
  console.log('User is', user)
})
  </pre>

<h3>Logout Function</h3>
  <pre>
// Logout, then get session should be empty
Auth.logout().then( user => {
  return Auth.getSession()
}).then(console.log)
  </pre>

  <hr />
  <h1>Server</h1>
  <h3>Auth Functions</h3>
  <p>Server should power all of the above functions using sessions</p>

  <h3>JWT Tokens</h3>
  <p>Allow authentication via JWT tokens</p>
<script>
Auth.getSession().then(console.log)
</script>
  `)
})
module.exports = router
