const { startServer, stopServer } = require('./server.js')
const { promisify } = require('util')

const startOnFirstAvailable = (port = 3001, maxTries = 10, cb) => {
  if (maxTries <= 0) {
    return cb(new Error('Avairable port is not found'), null)
  }
  startServer(port).then(() => {
    cb(null, port)
  }).catch(() => {
    startOnFirstAvailable(port + 1, maxTries - 1, cb)
  })
}

const startOnFirstPort = promisify(startOnFirstAvailable)

describe('server', () => {
  let port
  beforeAll(async () => {
    port = await startOnFirstPort(12000, 10)
    console.log('registered port is ', port)
  })
  afterAll(async () => {
    return await stopServer()
  })
  test('should be true', () => {
    expect(port).toEqual(3001)
  })
})
