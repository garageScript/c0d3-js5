const Auth = {}
const authContainer = (type) => {
  const url = `/auth/api/${type}`
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
  return fetch('/auth/api/session', {
    credentials: 'include'
  }).then(r => r.json())
}
Auth.logout = () => {
  return fetch('/auth/api/logout', {
    credentials: 'include'
  }).then(r => r.json())
}
window.Auth = Auth
