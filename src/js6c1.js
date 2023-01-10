const express = require('express')
const fetch = require('node-fetch')
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const cors = require('cors')
const { json } = require('body-parser')

const router = express.Router()

const allPokemon = {}
fetch(`https://pokeapi.co/api/v2/pokemon?limit=${2000}`).then(r => r.json()).then(result => {
  return result.results.forEach(poke => {
    allPokemon[poke.name] = {}
  })
})

const server = new ApolloServer({
  typeDefs: `
type Lesson {
  title: String
}
type BasicPokemon {
  name: String
}
type Pokemon {
  name: String
  image: String
}
type Query {
  lessons: [Lesson]
  search(str: String!): [BasicPokemon]
  getPokemon(str: String!): Pokemon
}
  `,
  resolvers: {
    Query: {
      lessons: () => {
        return fetch('https://c0d3.com/api/lessons').then(r => r.json())
      },
      search: (_first, { str = '' }) => {
        if (str.length < 2) {
          throw new Error('Input must be > 1 characters')
        }
        return Object.keys(allPokemon).filter(name => {
          return name.includes(str)
        }).map(name => {
          return {
            name
          }
        })
      },
      getPokemon: (_first, { str = '' }) => {
        return fetch(`https://pokeapi.co/api/v2/pokemon/${str}`).then(r => r.json()).then(poke => {
          return {
            name: poke.name,
            image: poke.sprites.front_default
          }
        })
      }
    }
  },
  introspection: true
})

server.start().then(() => {
  router.use(
    '/graphql',
    cors(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ req })
    })
  )
})

module.exports = router
