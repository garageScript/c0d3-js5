const express = require('express')
const session = require('express-session')
const router = express.Router()

router.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: false,
  cookie: { sameSite: 'none', secure: true }
}))

router.get('/api/login', (req, res) => {
  if (req.query.name) {
    req.session.username = req.query.name
    return res.json({ status: true })
  }
  res.json({ status: false })
})

const allMessages = []
router.get('/api/messages', (req, res) => {
  if (req.query.message) {
    allMessages.push({
      name: req.session.username,
      message: req.query.message
    })
  }
  res.json(allMessages)
})

router.post('/api/messages', (req, res) => {
  console.log(req.session.username)
  allMessages.push({
    name: req.session.username,
    message: req.body.message
  })
  res.json(allMessages)
})

router.get('/', (req, res) => {
  if (!req.session.username) {
    return res.send(`
<h1>Enter Your Name</h1>
<input class="name" type="text">
<button class="submit">Submit</button>
<script>
const $name = document.querySelector('.name')
const $submit = document.querySelector('.submit')
$name.focus()
$submit.addEventListener('click', () => {
  fetch('/chat/api/login?name=' + $name.value).then(d => {
  window.location = '/chat'
  })
})
</script>
    `)
  }
  return res.send(`
<h1>Chatroom</h1>
<style>
.name {
  font-weight: bold;
  display: inline-block;
  margin-right: 5px;
}
</style>
<input class="message" type="text">
<button class="submit">Submit</button>
<hr />
<div class="container"></div>
<script>
const $message = document.querySelector('.message')
const $submit = document.querySelector('.submit')
const $container = document.querySelector('.container')
const sendMessage = () => {
  const value = $message.value
  fetch('/chat/api/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      message: value
    })
  })
}
const getMessage = () => {
  fetch('/chat/api/messages').then(r => r.json()).then((data) => {
    $container.innerHTML = data.reduce((acc, e) => {
      return acc + '<div><span class="name">' + e.name + '</span>' + e.message + '</div>'
    }, '')
    setTimeout(() => {
      getMessage()
    }, 500)
  })
}
getMessage()
$submit.addEventListener('click', sendMessage)
$message.addEventListener('keyup', (e) => {
  if(e.key === 'Enter') {
    return sendMessage()
  }
})
</script>
  `)
})

module.exports = router
