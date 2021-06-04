/* globals afterAll beforeAll describe it jest expect */
const { app } = require('../server')
const request = require('supertest')
const jwt = require('jsonwebtoken')

// Prevent actual db writes/reads and seed mock user
jest.mock('./lib/db', () => ({
  getData: jest.fn().mockResolvedValue({
    mockUser: {
      username: 'mockUser',
      email: 'mock@mock',
      jwt: 'mockJwt',
      id: 'whoCares'
    }
  }),
  setData: jest.fn().mockReturnValue(null)
}))

describe('auth (js5/p6)', () => {
  const mockUser = { username: 'mockUser', email: 'mock@mock', jwt: 'mockJwt' }

  const validResponse = expect.objectContaining({
    ...mockUser,
    jwt: expect.any(String)
  })

  beforeAll(() => {
    jest.spyOn(jwt, 'verify').mockImplementation((jwt) => {
      if (jwt === mockUser.jwt) return mockUser
      throw Error('BAD JWT')
    })
    jest.spyOn(jwt, 'decode').mockReturnValue(mockUser)
  })

  afterAll(() => {
    jest.restoreAllMocks()
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
    const response = await request(app)
      .get('/auth/api/session')
      .set('Authorization', `Bearer ${'mockJwt'}`)
    expect(response.body).toEqual(validResponse)
  })
  it('should not return session with fake jwt', async () => {
    const response = await request(app)
      .get('/auth/api/session')
      .set('Authorization', `Bearer ${'BAD_JWT'}`)

    expect(response.body).not.toEqual(validResponse)
  })
})
