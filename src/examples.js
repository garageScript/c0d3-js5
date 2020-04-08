const express = require('express')
const fs = require('fs')
const { uuid } = require('uuidv4')
const router = express.Router()

router.options('/api/*', (req, res) => {
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Credentials'
  )
  res.send('ok')
})
/*
const getCookieValue = (cookie = '', key) => {
  const cookieStr = cookie.split(';').find(str => {
    return str.includes(`${key}=`)
  }) || ''

  return cookieStr.split('=')[1]
}
*/

router.get('/dnd', (req, res) => {
  res.send(`
  <style>
.container {
  position: fixed; top: 0; bottom: 0; left: 0; right: 0;
}
.container.dropping {
  background-color: #8f8;
}
  </style>
<div class="container"></div>
<script>
const container = document.querySelector('.container')
console.log('container', container)
const makeGreen = (e) => {
  container.classList.add('dropping')
  container.innerHTML = "<h1>Will upload " + e.dataTransfer.items.length + " Files</h1>"
  e.preventDefault()
}
const clearScreen = (e) => {
  container.classList.remove('dropping')
  container.innerHTML = ""
  e.preventDefault()
  return false
}
console.log('container', container)
document.body.addEventListener('dragover', makeGreen)
document.body.addEventListener('dragleave', clearScreen)

document.body.addEventListener('drop', (e) => {
  e.preventDefault()
	const files = Array.from(e.target.files || e.dataTransfer.files)
  // No files
	if (!files.length) {
		return
	}

	const formData = new FormData()
  files.forEach( file => {
		formData.append('assets[]', file, file.name)
  })
	fetch('/assetExercise/api/assets', {
		method: 'POST',
		body: formData
	}).then( r => r.json() ).then(arr => {
		window.location.reload()
	})
	return clearScreen(e)
})
</script>
  `)
})

const noteFile = './notes'
let notes = []
fs.readFile(noteFile, (err, data) => {
  if (err) {
    return console.log('error reading file')
  }
  const str = data.toString()
  if (str) {
    notes = JSON.parse(str)
  }
})
router.get('/notes', (req, res) => {
  const noteListString = notes.reduce((acc, note) => {
    return acc + `
    <h3>${note}</h3>
    `
  }, '')
  res.send(`
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/andybrewer/mvp/mvp.css" />
  <main>
  ${noteListString}
  <hr />
  <textarea class="noteInput" name="" cols="30" rows="10"></textarea>
  <button class="noteSubmit">Submit</button>
  <script>
  const textarea = document.querySelector('.noteInput')
  const submit = document.querySelector('.noteSubmit')
  submit.addEventListener('click', () => {
    const value = textarea.value
    fetch('./notes/add?content=' + value)
    textarea.value = ''
    alert('submitted. Refreshing the page to see your message')
    window.location.reload()
  })
  </script>
  `)
})

router.get('/notes/add', (req, res) => {
  const content = req.query.content
  if (!content) {
    return res.status(400).send('Please provide a content query parameter')
  }
  notes.unshift(content)
  notes = notes.splice(0, 5)
  fs.writeFile(noteFile, JSON.stringify(notes), () => {})
  res.json(notes)
})

const lastseen = {}
router.get('/online', (req, res) => {
  const name = req.query.name
  if (!name) {
    return res.status(401).send('Please set a query params with name as the key and your name as the value')
  }
  lastseen[name] = Date.now()
  res.send(`
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/andybrewer/mvp/mvp.css" />
  <main>
  <h1>Welcome ${name}</h1>
  <p>Open this page in another tab, use a different name!</p>
  <div class="container"></div>
  </main>
  <script>
  const container = document.querySelector('.container')
  const render = (data) => {
    console.log('data is', data)
    const otherUserString = data.reduce((acc, name) => {
      return acc + '<h1>' + name + '</h1>'
    }, '')
    if (otherUserString) {
      container.innerHTML = '<h2>Other Users</h2>' + otherUserString
    }
  }
  const getData = () => {
    fetch('./users?name=${name}').then(r => r.json()).then(data => {
      console.log('data is', data)
      render(data)
      setTimeout(() => {
        getData()
      }, 1000)
    })
  }
  getData()
  </script>
  `)
})

router.get('/users', (req, res) => {
  const authorName = req.query.name
  const now = Date.now()
  lastseen[authorName] = now // update the user that sent the request
  Object.keys(lastseen).forEach(name => {
    if (lastseen[name] < now - 1000 * 10) {
      // if last seen is > 10 seconds, remove
      delete lastseen[name]
    }
  })
  const online = Object.keys(lastseen).filter(name => {
    return name !== authorName
  })
  res.json(online)
})

router.get('/delayed', (req, res) => {
  setTimeout(() => {
    res.send(`
    <h1>Here is your response after ${req.query.time}ms delay</h1>
    `)
  }, +req.query.time)
})

let visitorId = 0
router.get('/ab', (req, res) => {
  const cookie = req.get('cookie') || ''
  const cookieStr = cookie.split(';').find(str => {
    return str.includes('abtest=')
  }) || ''

  let visitorKey = cookieStr.split('=')[1]
  if (!visitorKey) {
    visitorKey = visitorId
    visitorId = visitorId + 1
  }
  let color = '#2a2'
  if (+visitorKey % 3 === 0) { // happens 1 every 3 times
    color = '#a22'
  }
  res.set('set-cookie', `abtest=${visitorKey}`)
  res.send(`
  <style>
  h1 {
  color: ${color};
  }
  </style>
  <h1>Hello World</h1>
  `)
})

let uniqueVisitors = 0
router.get('/distinct', (req, res) => {
  const cookie = req.get('cookie') || ''
  const cookieStr = cookie.split(';').find(str => {
    return str.includes('guid=')
  }) || ''

  let guid = cookieStr.split('=')[1]
  if (cookieStr) {
    return res.send(`
      <h1>You have been identified with guid ${guid}</h1>
      <h3>Distinct Number of Visitor Count: ${uniqueVisitors}.</h3>
    `)
  }
  uniqueVisitors = uniqueVisitors + 1
  guid = uuid()
  res.set('set-cookie', `guid=${guid}`)
  res.send(`
  <h1>You have been ASSIGNED a guid ${guid}</h1>
  <h3>Distinct Number of Visitor Count: ${uniqueVisitors}.</h3>
  `)
})

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
  res.set('set-cookie', `hmmm=${Date.now()}`)
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

let visitorCount2 = 0
router.get('/abtest', (req, res) => {
  let color = '#2a2'
  visitorCount2 = visitorCount2 + 1
  if (visitorCount2 % 5 === 0) { // happens 1 every 3 times
    color = '#a22'
  }
  res.send(`
  <style>
  h1 {
  color: ${color};
  }
  </style>
  <h1>Hello World</h1>
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
