const express = require('express')
const fs = require('fs')
const URL = require('url')
const path = require('path')
const { getData, setData } = require('./lib/db')
const router = express.Router()

const assetPath = 'userUploads/assets'

let mappings = {}
getData('lambdaMapping').then((data) => {
  mappings = data || {}
})

router.get('/api/files', (req, res) => {
  fs.readdir(path.join(__dirname, `../${assetPath}`), (err, allFiles) => {
    if (err) {
      const errorMessage = `cannot read from ${assetPath} folder`
      req.error(errorMessage, err)
      return res.json({
        error: errorMessage
      })
    }
    const files = allFiles.filter(f => f.includes('.js')).sort((a, b) => a - b)
    req.log('lambdas-api-files', files)
    res.json(files)
  })
})

router.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../views/lambdas.html'))
})

router.get('/api/mappings', (req, res) => {
  res.json(mappings)
})

router.post('/api/mappings', (req, res) => {
  req.log('lambda route create mapping', req.body)
  if (req.body.route === '' || req.body.route.includes('api')) {
    req.warn('lambdaroutecreateion', 'invalid route')
    return res.status(400).send('Cannot contain the words api or be empty')
  }
  const key = `/lambdas/${req.body.route}`
  const assetPathName = path.join(__dirname, `../${assetPath}/${req.body.file}`)
  mappings[key] = {
    fullPath: assetPathName,
    fileName: req.body.file
  }
  setData('lambdaMapping', mappings)
  res.json({
    mappings, body: req.body
  })
})

router.use('/*', (req, res, next) => {
  req.log('lambda originalUrl', req.originalUrl)
  // eslint-disable-next-line
  const pathname = URL.parse(req.originalUrl).pathname
  req.log('lambda path', pathname)
  const route = mappings[pathname]
  if (!route) {
    req.warn('lambda route not found', req.originalUrl)
    return res.status(400).send('No Lambdas Available')
  }
  req.log('lambda route', req.route)
  try {
    const fn = require(route.fullPath)
    fn(req, res, next)
  } catch (e) {
    req.error('error lambda function handler', e)
    res.status(400).send(`ERROR: ${e}`)
  }
})

module.exports = router
