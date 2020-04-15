const { startServer } = require('./server')

const port = process.env.PORT || 3020
startServer(port).then(() => {
  console.log('server started on port', port)
}).catch(err => {
  console.error('There has been an error', err)
})
