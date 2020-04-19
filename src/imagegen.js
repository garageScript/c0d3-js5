const express = require('express')
const Jimp = require('jimp')
const router = express.Router()

let fontWhite, fontBlack
Promise.all([Jimp.loadFont(Jimp.FONT_SANS_32_WHITE), Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)]).then(fonts => {
  fontWhite = fonts[0]
  fontBlack = fonts[1]
})

const memeMap = { }

router.get('/api/:text', async (req, res) => {
  const { src, blur, black } = req.query
  const text = req.params.text
  const key = `${src}${text}${blur}${black}`
  const memeInfo = memeMap[key]
  if (memeInfo) {
    memeInfo.count += 1
    res.set('Content-Type', 'image/jpeg')
    return res.send(memeInfo.image)
  }
  const url = src || 'https://placeimg.com/640/360/any'
  const image = await Jimp.read(url)

  if (blur) {
    image.blur(parseInt(blur))
  }
  const font = black ? fontBlack : fontWhite
  image.print(font, 0, 0, req.params.text || 'Herro')
  const buffer = await image.getBufferAsync(Jimp.MIME_JPEG)
  if (Object.keys(memeMap).length > 1) {
    const smallestKey = Object.keys(memeMap).reduce((acc, mapKey) => {
      if (!memeMap[acc] || memeMap[mapKey].count < memeMap[acc].count) {
        return mapKey
      }
      return acc
    }, '')
    delete memeMap[smallestKey]
  }
  memeMap[key] = {
    image: buffer,
    count: 0,
    key
  }
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
