const express = require('express')
const { exec } = require('child_process')
const router = express.Router()

router.post('/', (req, res) => {
  const command = req.body.command
  const argList = command.split(' ')
  const allowed = [
    'ls',
    'cd',
    'touch',
    'git',
    'cat'
  ]
  console.log('command is: ', command)
  if (!allowed.includes(argList[0]) || argList.length > 2) {
    return res.json({ output: 'command not allowed' })
  }
  exec(`${argList[0]} ${argList[1] || ''}`, {}, (err, stdout) => {
    if (err) {
      return res.json({ output: 'error' })
    }
    res.json({ output: stdout || 'your command resulted in no output' })
  })
})

module.exports = router
