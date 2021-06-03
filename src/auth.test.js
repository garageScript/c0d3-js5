/* globals describe it jest expect */
const { app } = require('../server')
const request = require('supertest')
const jwt = require('jsonwebtoken')

// Prevent actual db writes/reads
jest.mock('./lib/db', () => ({
  getData: jest.fn().mockResolvedValue({}),
  setData: jest.fn().mockReturnValue(null)
}))

describe('auth (js5/p6)', () => {
  const mockUser = { username: 'tom', email: 'tom@tom' }

  const validResponse = expect.objectContaining({
    ...mockUser,
    jwt: expect.any(String)
  })

  // set real jwt when creating user
  let realJwt
  it('creating a user return a jwt', async () => {
    const response = await request(app)
      .post('/auth/api/users')
      .send({
        ...mockUser,
        password: 'anything'
      })

    expect(response.body).toEqual(validResponse)
    realJwt = response.body.jwt
  })
  it('can get session with jwt', async () => {
    const response = await request(app)
      .get('/auth/api/session')
      .set('Authorization', `Bearer ${realJwt}`)

    expect(response.body).toEqual(validResponse)
  })
  it('should not return session with fake jwt', async () => {
    const fakeJwt = await jwt.sign({ username: 'tom' }, 'just_a_random_key')
    const response = await request(app)
      .get('/auth/api/session')
      .set('Authorization', `Bearer ${fakeJwt}`)

    expect(response.body).not.toEqual(
      expect.objectContaining({ ...mockUser, jwt: realJwt })
    )
  })
})
