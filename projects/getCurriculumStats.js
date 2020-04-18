const fetch = require('node-fetch')
const fs = require('fs')

const start = async (err, data) => {
  if (err) {
    data = await fetch('https://c0d3devhasura.herokuapp.com/v1/graphql', {
      credentials: 'omit',
      headers: {
        'content-type': 'application/json'
      },
      referrer: 'https://c0d3devhasura.herokuapp.com/console/api-explorer',
      body: '{"query":"query MyQuery {\\n  userLessons(where: {isPassed: {_neq: \\"\\"}}) {\\n    isPassed\\n    isEnrolled\\n    user {\\n      id\\n      isAdmin\\n      name\\n      stars {\\n        lessonId\\n      }\\n      password\\n    }\\n    lesson {\\n order      title\\n    }\\n  }\\n}\\n","variables":null,"operationName":"MyQuery"}',
      method: 'POST',
      mode: 'cors'
    }).then(r => r.json())
    fs.writeFile('./c0d3data', JSON.stringify(data), () => {})
  } else {
    data = JSON.parse(data.toString())
  }

  const titleOrderMap = {}
  const userLessons = data.data.userLessons.map(ul => {
    ul.passDate = new Date(+ul.isPassed)
    ul.un = ul.user.name
    ul.title = ul.lesson.title
    titleOrderMap[ul.title] = ul.lesson.order
    delete ul.user
    delete ul.isEnrolled
    delete ul.lesson
    return ul
  }).filter(ul => {
    return ul.passDate.getUTCFullYear() === 2019
  })
  const groups = userLessons.reduce((acc, ul) => {
    acc[ul.title] = acc[ul.title] || []
    acc[ul.title].push(ul.un)
    return acc
  }, {})

  const orderedTitles = Object.keys(groups).sort((a, b) => {
    return titleOrderMap[a] - titleOrderMap[b]
  })
  orderedTitles.forEach((title, i) => {
    const info = groups[title]
    console.log('----- ---')
    console.log(`👺----- lesson ${i}: ${title} ---`)
    console.log(`${info.length} students completed this lesson`)
    console.log('\x1b[0m', `Names: ${info.join(',')}`)
  })
}

fs.readFile('./c0d3data', start)
