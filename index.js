const { startServer } = require('./server')
const logger = require('./src/log')(__filename)

const port = process.env.PORT || 3020
startServer(port).then(() => {
  logger.log('server started on port', port)
}).catch(err => {
  logger.error('There has been an error', err)
})
