const { createLogger, format, transports } = require('winston')
const { combine, label } = format
const { basename } = require('path')
const util = require('util')

const processArgs = (inputArr) => {
  const args = inputArr.map(e => {
    if (e instanceof Error) {
      return e.toString()
    }
    return e
  })
  const objstr = util.format('%j', args)
  return objstr
}

function Logger (logger) {
  this.log = (...args) => {
    logger.info(processArgs(args))
  }
  this.warn = (...args) => {
    logger.warn(processArgs(args))
  }
  this.error = (...args) => {
    logger.error(processArgs(args))
  }
}

const output = (file, sessionId = '') => {
  const base = file ? basename(file) : '-'
  const logger = createLogger({
    format: combine(
      label({ label: base }),
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.simple(),
      format.printf(info => {
        const sessionDisplay = sessionId ? ` ${sessionId}` : ''
        return `${info.timestamp} ${info.level} [${info.label}${sessionDisplay}]: ${info.message}`
      })
    ),
    transports: [
      new transports.Console({
        prettyPrint: true,
        json: true
      })
    ]
  })

  return new Logger(logger)
}

module.exports = output
