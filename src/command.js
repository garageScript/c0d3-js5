const express = require('express')
const { exec } = require('child_process')
const router = express.Router()

router.post('/', (req, res) => {
  const command = req.body.command
  console.log('command executed', command)
  exec(command, {}, (err, stdout) => {
    if (err) {
      return res.json({ output: 'error' })
    }
    res.json({ output: stdout || 'your command resulted in no output' })
  })
})

module.exports = router
