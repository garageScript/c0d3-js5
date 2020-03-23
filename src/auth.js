const express = require('express')
const bcrypt = require('bcrypt')
const session = require('express-session')
const { uuid } = require('uuidv4')
const { getData, setData } = require('./db')
const router = express.Router()

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

// DOCS about session
// resave:
//     If your store sets an expiration date on stored sessions, then you likely need resave: true.
// saveUninitialized:
//     Choosing false is useful for implementing login sessions,
//     reducing server storage usage,
//     or complying with laws that require permission before setting a cookie.
router.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: false
}))

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
  if (usernameList[userInfo.username]) {
    return res.errJSON('Username is taken, please pick another')
  }
  if (emailMapping[userInfo.email]) {
    return res.errJSON('Email is taken, please pick another')
  }
  const tmpPassword = Buffer.from(userInfo.password, 'base64').toString()
  bcrypt.hash(tmpPassword, SALT_ROUNDS, (err, hash) => {
    if (err) {
      return res.errJSON('Error has occurred in the server. Please try again at a later time')
    }
    userInfo.password = hash
    saveUser(userInfo)
    res.json(userInfo)
  })
})

router.get('/api/session', (req, res) => {
  if (!req.user) {
    return res.errJSON('Not logged in')
  }
  return res.json(req.user)
})

router.post('/api/session', (req, res) => {
  const userInfo = { ...req.body }
  const identity = usernameList[userInfo.username]
  if (!identity) {
    return res.errJSON('User not found')
  }
  const tmpPassword = Buffer.from(userInfo.password, 'base64').toString()
  bcrypt.compare(tmpPassword, identity.password, (err, result) => {
    if (err) {
      return res.errJSON('Error has occurred in the server. Please try again at a later time')
    }
    if (!result) {
      return res.errJSON('Wrong credentials')
    }
    req.session.username = identity.username
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

<script>
Auth.getSession().then(console.log)
</script>
  `)
})
module.exports = router
