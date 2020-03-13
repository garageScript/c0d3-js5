const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()
console.log('', __dirname)

// define the home page route
router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../public/assetExercise/index.html'))
})

router.post('/api/files', function (req, res) {
  fs.writeFile(path.join(__dirname, `../public/assetExercise/${req.body.name}`), req.body.content, () => {})
  res.json(req.body)
})

router.get('/api/files', function (req, res) {
  fs.readdir(path.join(__dirname, `../public/assetExercise/`), (err, data) => {
    res.json(data || [])
  })
})

router.get('/api/files/:name', function (req, res) {
  fs.readFile(path.join(__dirname, `../public/assetExercise/${req.params.name}`), (err, content) => {
    res.json({
      name: req.params.name,
      content: content.toString()
    })
  })
})

module.exports = router

