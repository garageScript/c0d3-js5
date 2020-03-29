const express = require('express')
const Jimp = require('jimp')
const router = express.Router()

router.get('/api/:name', async (req, res) => {
  const category = req.query.category || 'any'
  console.log('category', category)
  const image = await Jimp.read(`https://placeimg.com/640/360/${category}`)

  if (req.query.greyscale) {
    image.greyscale()
  }

  if (req.query.sepia) {
    image.sepia()
  }

  if (req.query.blur) {
    image.blur(parseInt(req.query.blur))
  }

  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
  image.print(font, 0, 0, {
    text: req.params.name || 'Herro'
  }, 640, 360)
  const buffer = await image.getBufferAsync(Jimp.MIME_JPEG)
  res.set('Content-Type', 'image/jpeg')
  res.send(buffer)
})

router.get('/', (req, res) => {
  res.send(`
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/andybrewer/mvp/mvp.css"></link>
  <main>
  <h1>Image API</h1>
  <p>
    This page teaches you about generating Images using the 
    <a href="https://www.npmjs.com/package/jimp"> Jimp Library </a>
  </p>
  <pre>
  https://js5.c0d3.com/imggen/api/great job?blur=4&sepia=1&greyscale=1&category=nature
  </pre>
  <p>As you can see in the url above, you can put any text into the image</p>
  <p>Query parameters after that will specify whether you want any manipulation done to your image</p>
  <p>The only query paramters supported are sepia, greyscale, blur, and category</p>
  <p>Categories supported: arch, animals, nature, people, tech</p>
  <h2>Libraries Used</h2>
  <p>
    <a href="https://www.npmjs.com/package/jimp"> Jimp Library </a>
  </p>
  <p>
    <a href="https://placeimg.com/">Place IMG</a>
  </p>
  <h3>Sample Image Below</h3>
  <img src="https://js5.c0d3.com/imggen/api/super awesome city?category=arch" alt="" />
  <img src="https://js5.c0d3.com/imggen/api/awwwww cute?category=animals" alt="" />
  </main>
  `)
})

module.exports = router
