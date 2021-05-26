const request = require('supertest')
const { app } = require('../server')

/* globals describe it expect */
describe('commands', () => {
  describe('POST /commands', () => {
    it.each([
      'ls -a',
      'ls -aA',
      'ls -sra',
      'ls --all',
      'cat .ssh',
      'cat ../.env',
      'cat ~/.git'
    ])(
      'Blocks commands that would expose hidden files, %s',
      async (command) => {
        await request(app)
          .post('/commands')
          .send({ command: command })
          .expect('Content-Type', /json/)
          .then((response) => {
            expect(response.body.output).toBe(
              'Error: hidden files are private'
            )
          })
      }
    )
  })
})
