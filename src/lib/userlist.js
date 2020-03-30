const { getData, setData } = require('./db')

let usernameList = {}
const emailMapping = {}
getData('userList').then((data) => {
  usernameList = data || {}
  Object.values(usernameList).forEach(user => {
    emailMapping[user.email] = user
  })
})

const saveUser = (userInfo) => {
  usernameList[userInfo.username] = userInfo
  emailMapping[userInfo.email] = userInfo
  setData('userList', usernameList)
}

const getUser = (username) => {
  return usernameList[username]
}

const getUserByEmail = (email) => {
  return emailMapping[email]
}

const getAllUsers = () => {
  return Object.values(emailMapping)
}

module.exports = {
  saveUser, getUser, getUserByEmail, getAllUsers
}
