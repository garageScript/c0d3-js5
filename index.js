const express = require('express');
const app = express();
const assetExercise = require('./src/assetExercise');
app.use(express.static('public'));
app.use(express.json());

app.use('/assetExercise', assetExercise)

app.listen(process.env.PORT || 3020);
