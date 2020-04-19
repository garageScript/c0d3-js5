const express = require('express')
const fs = require('fs')
const { getData, setData } = require('./lib/db')
const router = express.Router()
/*
const path = require('path')
const Tesseract = require('tesseract.js')

Tesseract.recognize(
  path.resolve(__dirname, '../public/uploaded_images/2.png'),
  'eng',
  { logger: m => console.log(m) }
).then(({ data: { text } }) => {
  console.log(text)
})
*/

let ocrList = []
getData('ocrdata').then((data) => {
  ocrList = data || []
})

router.post('/', (req, res) => {
  const id = ocrList.length
  fs.writeFileSync(`./public/uploaded_images/${id}.png`, Buffer.from(req.body.imgData, 'base64'))
  const newStr = req.body.text.replace(/[^a-z0-9]/gi, '').toLowerCase()
  ocrList.push({ path: `https://js5.c0d3.com/uploaded_images/${id}.png`, text: newStr })
  console.log('text str', newStr)
  setData('ocrdata', ocrList)
  res.json({ status: 'done' })
})

router.get('/search/:query', (req, res) => {
  const query = req.params.query.replace(/[^a-z0-9]/gi, '').toLowerCase()
  const results = ocrList.filter(d => d.text.includes(query))
  res.json(results)
})

router.get('/blah', (req, res) => {
  const query = req.params.query.replace(/[^a-z0-9]/gi, '').toLowerCase()
  const results = ocrList.filter(d => d.text.includes(query))

  res.json(results)
})

module.exports = router
