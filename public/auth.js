const Auth = {}

const endpoint = 'https://js5.c0d3.com'
const authContainer = (type) => {
  const url = `${endpoint}/auth/api/${type}`
  return (userInfo) => {
    const data = { ...userInfo }
    data.password = btoa(data.password)
    return fetch(url, {
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(data)
    }).then(r => r.json()).then(console.log)
  }
}
Auth.login = authContainer('session')
Auth.signup = authContainer('users')
Auth.getSession = () => {
  return fetch(`${endpoint}/auth/api/session`, {
    credentials: 'include'
  }).then(r => r.json())
}
Auth.logout = () => {
  return fetch(`${endpoint}/auth/api/logout`, {
    credentials: 'include'
  }).then(r => r.json())
}
window.Auth = Auth
