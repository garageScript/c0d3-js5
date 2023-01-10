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

const allUsers = {}

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
type User {
  name: String
  image: String
  lessons: [Lesson]
}
type Query {
  lessons: [Lesson]
  search(str: String!): [BasicPokemon]
  getPokemon(str: String!): Pokemon
  user: User
  login(pokemon: String!): User
}
type Mutation {
  enroll(title: String!): User
  unenroll(title: String!): User
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
      },
      user: (_first, _args, { req }) => {
        const user = req.session.pokemon
        if (!user) {
          return null
        }
        console.log(allUsers[user])
        const userLessons = Object.keys(allUsers[user].lessons).map((title) => {
          return { title }
        })
        return { ...allUsers[user], lessons: userLessons }
      },
      login: (_first, args, { req }) => {
        req.session.pokemon = args.pokemon
        if (allUsers[args.pokemon]) {
          return allUsers[args.pokemon]
        }
        return fetch(`https://pokeapi.co/api/v2/pokemon/${args.pokemon}`).then(r => r.json()).then(poke => {
          const data = {
            name: poke.name,
            image: poke.sprites.front_default,
            lessons: {}
          }
          allUsers[args.pokemon] = data
          return { ...data, lessons: [] }
        })
      }
    },
    Mutation: {
      enroll: (_first, args, { req }) => {
        const user = req.session.pokemon
        if (!user) {
          return null
        }
        const userInfo = allUsers[user]
        console.log('args', args.title)
        console.log('userInfo', userInfo)
        userInfo.lessons[args.title] = true
        allUsers[user] = userInfo
        console.log('userInfo', userInfo.lessons)
        return { ...allUsers[user], lessons: Object.keys(allUsers[user].lessons) }
      },
      unenroll: (_first, args, { req }) => {
        const user = req.session.pokemon
        if (!user) {
          return null
        }
        const userInfo = allUsers[user]
        delete userInfo.lessons[args.title]
        allUsers[user] = userInfo
        return { ...allUsers[user], lessons: Object.keys(allUsers[user].lessons) }
      }
    }
  },
  introspection: true
})

server.start().then(() => {
  router.use(
    '/graphql',
    cors(
      {
        credentials: true,
        origin: true
      }
    ),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ req })
    })
  )
})

module.exports = router
