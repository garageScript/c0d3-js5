/* globals describe it jest expect */
const { app } = require('../server')
const request = require('supertest')
const jwt = require('jsonwebtoken')
const { saveUser } = require('./lib/userlist')
const { JWT_PRIVATE_SECRET } = require('./lib/fakeEnv')

// Prevent actual db writes/reads
jest.mock('./lib/db', () => ({
  getData: jest.fn().mockResolvedValue({}),
  setData: jest.fn().mockReturnValue(null)
}))

describe('auth (js5/p6)', () => {
  const mockUser = { username: 'mockUser', email: 'mock@mock', jwt: 'mockJwt' }

  const validResponse = expect.objectContaining({
    ...mockUser,
    jwt: expect.any(String)
  })

  it('creating a new user return a jwt', async () => {
    const response = await request(app).post('/auth/api/users').send({
      username: 'tom',
      email: 'tom@tom',
      password: 'anything'
    })

    expect(response.body).toEqual(
      expect.objectContaining({
        jwt: expect.any(String)
      })
    )
  })
  it('can get session with jwt', async () => {
    const token = jwt.sign({ username: mockUser.username }, JWT_PRIVATE_SECRET)
    saveUser({ ...mockUser, jwt: token })
    const response = await request(app)
      .get('/auth/api/session')
      .set('Authorization', `Bearer ${token}`)
    expect(response.body).toEqual(validResponse)
  })
  it('should not return session with fake jwt', async () => {
    const badToken = jwt.sign({ username: mockUser.username }, 'bad_key')
    saveUser({ ...mockUser, jwt: badToken })
    const response = await request(app)
      .get('/auth/api/session')
      .set('Authorization', `Bearer ${badToken}`)

    expect(response.body).not.toEqual(validResponse)
  })
})
