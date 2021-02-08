const express = require('express')
const { execFile } = require('child_process')
const router = express.Router()

const HOME_PATH = require('os').homedir()

// allowed characters regex
// only alphanumeric, whitespace, '-', '_', '~', '.' and '/'
const safe = /^[a-zA-Z0-9-_~/.\s]*$/

const allowed = [
  'ls',
  'cd',
  'touch',
  'git',
  'pwd',
  'cat'
]

router.post('/', (req, res) => {
  const { command } = req.body
  // have to replace "~" because execFile doesn't do expansion
  req.log('command is: ', command)
  const argList = command.replace(/~/g, HOME_PATH).split(' ')
  if (!allowed.includes(argList[0]) || !safe.test(command)) {
    return res.json({ output: 'command not allowed' })
  }
  execFile(argList[0], argList.slice(1), (err, stdout) => {
    if (err) {
      return res.json({ output: 'error' })
    }
    res.json({ output: stdout || 'your command resulted in no output' })
  })
})

module.exports = router
