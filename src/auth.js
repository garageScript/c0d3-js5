const express = require('express')
const bcrypt = require('bcrypt')
const { uuid } = require('uuidv4')
const { getData, setData } = require('./db')
const router = express.Router()

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
  const sendJson = res.json.bind(res)
  res.json = (...args) => {
    delete args[0].password
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
    return res.json(identity)
  })
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
<script>
Auth.login({
  username: 'songz',
  password: 'helpless',
})
</script>
  `)
})
module.exports = router
