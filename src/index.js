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

const td = `
type Query {
    users: [User!]
    radio(id: ID!): Radio
    radios: [Radio!]
    searchMedia(filter: String!, radioId: String): [MediaSearchResult!]
}

type Mutation {
    signup(email: String!, password: String!, name: String!): AuthPayload
    anonymousSignup: AuthPayload
    login(email: String!, password: String!): AuthPayload
    createRadio(name: String!): Radio!
    connectToRadio(hash: String!): Radio!
    sendMediaItem(
        radioId: String!,
        source: String!,
        externalId: String!,
        title: String!,
        thumbnailUrl: String,
        channelTitle: String,
        publishedAt: String,
    ): MediaItem!
    play(radioId: String!, mediaItemId: String): MediaItem
    finish(radioId: String!, mediaItemId: String!, playNext: Boolean!): MediaItem
}

type Subscription {
    radioMediaItemCreated(radioId: ID!): MediaItem
    radioMediaItemUpdated(radioId: ID!): MediaItem
}

type AuthPayload {
    token: String
    user: User
}

type User {
    id: ID!
    name: String!
    email: String!
}

type Radio {
    id: ID!
    name: String!
    hash: String!
    createdBy: User!
    people: [RadioUser!]
    itemsPlaying: [MediaItem!]
    itemsQueued: [MediaItem!]
    itemsPlayed: [MediaItem!]
}

type RadioUser {
    id: ID!
    radio: Radio!
    user: User!
    connectedAt: String!
}

type MediaSearchResult {
    id: ID!
    title: String!
    source: String!
    thumbnailUrl: String!
    channelTitle: String!
    publishedAt: String!
    exists: Boolean!
}

type MediaItem {
    id: ID!
    externalId: String!
    source: String!
    title: String!
    sentBy: User!
    sentAt: String!
    radio: Radio!
    status: MediaItemStatus!
    thumbnailUrl: String
    channelTitle: String
    publishedAt: String

}

enum MediaItemStatus {
    REQUESTED
    REJECTED
    QUEUED
    NOW_PLAYING
    PLAYED
}

`

const server = new GraphQLServerLambda({
  typeDefs: td,
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