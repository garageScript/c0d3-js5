const express = require('express')
const locationRoute = require('./src/location')
const app = express()
const assetExercise = require('./src/assetExercise')

app.set('trust proxy', true)
app.use(express.static('public'))
app.use(express.json())

app.use('/assetExercise', assetExercise)
app.use('/location', locationRoute)

app.listen(process.env.PORT || 3020)
