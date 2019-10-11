const {GraphQLServer} = require('graphql-yoga')
const {GraphQLServerLambda} = require('graphql-yoga')
const _ = require('lodash')
const { prisma } = require('../prisma/generated/prisma-client')

const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const User = require('./resolvers/User')
const Radio = require('./resolvers/Radio')
const RadioUser = require('./resolvers/RadioUser')
const MediaItem = require('./resolvers/MediaItem')
const Subscription = require('./resolvers/Subscription')
// const Vote = require('./resolvers/Vote')


const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Radio,
  RadioUser,
  MediaItem,
  // Vote,
}

const server = new GraphQLServerLambda({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: request => {
    return {
      ...request,
      prisma,
    }
  },
})

exports.handler = server.handler
// server.start(() => console.log(`Server is running on http://0.0.0.0:4000`))