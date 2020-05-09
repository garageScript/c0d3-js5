const express = require('express')
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const logger = require('./log')(__dirname)

const router = express.Router()

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../userUploads/assets/'),
  filename: function (_, file, cb) {
    logger.log('renaming file if needed', file.originalname)
    cb(null, `${file.originalname.replace(/ /g, '-')}`)
  }
})
const upload = multer({ storage })

const assetPath = 'userUploads/assetExercise'
router.use('/userUploads', express.static(path.join(__dirname, `../${assetPath}`)))
router.use('/userAssets', express.static(path.join(__dirname, '../userUploads/assets/')))

// define the home page route
router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, `../${assetPath}/index.html`))
})

router.get('/simple', function (req, res) {
  res.sendFile(path.join(__dirname, '../views/assetExercise.html'))
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
  req.log('uploaded files, sending back response', fileListResponse)
  res.json(fileListResponse)
})

router.get('/api/files', function (req, res) {
  fs.readdir(path.join(__dirname, `../${assetPath}`), (err, data) => {
    if (err) {
      res.status(500).json(err)
    }
    res.json(data || [])
  })
})

router.get('/api/files/:name', function (req, res) {
  fs.readFile(path.join(__dirname, `../${assetPath}/${req.params.name}`), (err, fileContent) => {
    if (err) {
      res.status(500).json(err)
    }
    const content = (fileContent && fileContent.toString()) || ''
    res.json({
      name: req.params.name,
      content
    })
  })
})

module.exports = router
