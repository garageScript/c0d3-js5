const express = require('express')
const fs = require('fs')
const path = require('path')
const multer = require('multer')

const router = express.Router()

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../public/assetExercise/'),
  filename: function (_, file, cb) {
    cb(null, `${file.originalname.replace(/ /g, '-')}`)
  }
})
const upload = multer({ storage })

const assetPath = 'userUploads/assetExercise'
router.get('/userUploads', express.static(path.join(__dirname, `../${assetPath}`)))

// define the home page route
router.get('/', function (req, res) {
  console.log('whach eettting?')
  res.sendFile(path.join(__dirname, `../${assetPath}/index.html`))
})

router.post('/api/files', function (req, res) {
  fs.writeFile(path.join(__dirname, `../${assetPath}/${req.body.name}`), req.body.content, () => {})
  res.json(req.body)
})

router.post('/api/assets', upload.any('assets'), function (req, res) {
  const fileListResponse = req.files.map(f => {
    return {
      name: f.filename
    }
  })

  res.json(fileListResponse)
})

router.get('/api/files', function (req, res) {
  fs.readdir(path.join(__dirname, `../${assetPath}`), (err, data) => {
    res.json(data || [])
  })
})

router.get('/api/files/:name', function (req, res) {
  fs.readFile(path.join(__dirname, `../public/assetExercise/${req.params.name}`), (err, fileContent) => {
    const content = (fileContent && fileContent.toString()) || ''
    res.json({
      name: req.params.name,
      content
    })
  })
})

module.exports = router
