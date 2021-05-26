const request = require('supertest')
const { app } = require('../server')

/* globals describe it expect */
describe('assetExercise (js5/p4)', () => {
  describe('GET /api/files', () => {
    it.each(['../..', '../../.ssh'])('unsafe names ( %s) returns status 400 with error', async (unsafeName) => {
      await request(app).get(`/assetExercise/api/files/${encodeURIComponent(unsafeName)}`)
        .expect(400)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body.error).not.toBeUndefined()
        })
    })
    it.each(['test', 'tom'])('safe name ( %s ) does not return status 400', async (unsafeName) => {
      const response = await request(app).get(`/assetExercise/api/files/${encodeURIComponent(unsafeName)}`)
      expect(response.status).not.toBe(400)
    })
  })
  describe('POST /api/files', () => {
    it.each(['../..', '../sneaky'])('unsafe names ( %s) returns status 400 with error', async (unsafeName) => {
      await request(app).post('/assetExercise/api/files')
        .send({ name: unsafeName, content: '' })
        .expect('Content-Type', /json/)
        .expect(400).then(response => {
          expect(response.body.error).not.toBeUndefined()
        })
    })
    it.each(['test', 'tom'])('safe name ( %s ) does return ok response', async (unsafeName) => {
      const response = await request(app).post('/assetExercise/api/files')
        .send({ name: unsafeName, content: '' })
      expect(response.ok)
    })
  })
  
})
