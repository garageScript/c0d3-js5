const fs = require('fs')
const path = require('path')

let initialized = false
const callbacks = []
const dbPath = path.resolve(__dirname, './data.db')
fs.readFile(dbPath, (err, data) => {
  initialized = true
  if (err || !data || !data.toString()) {
    callbacks.forEach(fn => fn())
    return
  }
  try {
    db.values = JSON.parse(data)
  } catch (e) {
    console.log('parsing err', e)
  }
  callbacks.forEach(fn => fn())
})

const db = {
  values: {},
  setData: (type, data) => {
    db.values[type] = data
    fs.writeFile(dbPath, JSON.stringify(db.values, null, 2), () => {})
  },
  getData: type => {
    return new Promise((resolve, reject) => {
      if (initialized) {
        return resolve(db.values[type])
      }
      callbacks.push(() => {
        return resolve(db.values[type])
      })
    })
  }
}

module.exports = db
