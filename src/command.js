const express = require('express')
const { execFile } = require('child_process')
const router = express.Router()

// allowed characters regex
// only alphanumeric, whitespace, '-', '_', '~', '.' and '/'
const safe = /^[a-zA-Z0-9-_~\/\.\s]*$/;

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
  const argList = command.split(' ')
  req.log('command is: ', argList[0], argList.slice(1))
  if (!allowed.includes(argList[0]) || !safe.test(command)) {
    return res.json({ output: 'command not allowed' })
  }
  execFile(argList[0], argList.slice(1), {}, (err, stdout) => {
    if (err) {
      return res.json({ output: 'error' })
    }
    res.json({ output: stdout || 'your command resulted in no output' })
  })
})

module.exports = router
