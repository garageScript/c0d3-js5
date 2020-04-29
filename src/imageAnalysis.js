const express = require('express')
const { uuid } = require('uuidv4')
const path = require('path')
const multer = require('multer')
const logger = require('./log')(__filename)
const Tesseract = require('tesseract.js')

const router = express.Router()

const assetPath = 'userUploads/analysis'

const processFile = (file, cb) => {
  const fn = file.name
  try {
    Tesseract.recognize(
      path.resolve(__dirname, `../${assetPath}/${fn}`),
      'eng',
      { logger: m => logger.log(m) }
    ).then(({ data: { text } }) => {
      if (!text) {
        logger.error(`no text for file ${fn}`)
        return cb(new Error(`no text for file ${fn}`))
      }
      logger.log(`Text detected for ${fn}`, text)
      return cb(null, text)
    })
  } catch (err) {
    return cb(err)
  }
}

const storage = multer.diskStorage({
  destination: path.join(__dirname, `../${assetPath}`),
  filename: function (_, file, cb) {
    logger.log('renaming file if needed', file.originalname)
    cb(null, `${file.originalname.replace(/ /g, '-')}`)
  }
})
const upload = multer({ storage })

router.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../views/imageAnalysis.html'))
})

router.get('/jobs/:jobid', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../views/imageAnalysisJob.html'))
})

router.use(`/${assetPath}`, express.static(path.join(__dirname, `../${assetPath}`)))

const allJobs = {}

router.post('/api/assets', upload.any('assets'), function (req, res) {
  const fileListResponse = req.files.map(f => {
    return {
      name: f.filename,
      url: `/imageAnalysis/${assetPath}/${f.filename}`,
      status: 'processing'
    }
  })

  const jobId = uuid()
  allJobs[jobId] = fileListResponse
  fileListResponse.forEach(file => {
    processFile(file, (err, text) => {
      if (err) {
        file.status = 'error'
        file.text = err.toString()
        return
      }
      file.status = 'complete'
      file.text = text
    })
  })
  return res.json({
    url: `https://js5.c0d3.com/imageAnalysis/jobs/${jobId}`
  })
})

router.get('/api/jobs/:jobid', (req, res) => {
  const job = allJobs[req.params.jobid]
  return res.json(job)
})

module.exports = router
