const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

async function signup(parent, args, context, info) {
  const password = await bcrypt.hash(args.password, 10)
  const user = await context.prisma.createUser({ ...args, password })
  const token = jwt.sign({ userId: user.id }, APP_SECRET)
  return {
    token,
    user,
  }
}

async function anonymousSignup(parent, args, context, info) {
  let randomUser = await fetch('https://randomuser.me/api/?nat=en&inc=login')
  randomUser = await randomUser.json()
  randomUser = randomUser.results[0]
  const name = randomUser.login.username
  const password = randomUser.login.password
  const email = `${name}@anon.com`
  const user = await context.prisma.createUser({ name, password, email })
  const token = jwt.sign({ userId: user.id }, APP_SECRET)
  return {
    token,
    user,
  }
}

async function login(parent, args, context, info) {
  const user = await context.prisma.user({ email: args.email })
  if (!user) {
    throw new Error('No such user found')
  }
  const valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error('Invalid password')
  }
  const token = jwt.sign({ userId: user.id }, APP_SECRET)
  return {
    token,
    user,
  }
}

async function createRadio(parent, args, context, info){
  const userId = getUserId(context)
  // create the hash based on the name
  const number = Math.floor((Math.random() * 999) + 1)
  const hash = `${args.name}${number}`
  const radio = await context.prisma.createRadio({
    name: args.name,
    hash: hash,
    createdBy: { connect: { id: userId } },
  })
  return radio
}

async function connectToRadio(parent, args, context, info){
  const userId = getUserId(context)
  const radio = await context.prisma.radio({hash: args.hash})

  if(!radio){
    throw new Error(`Could not find the radio with the name: ${args.hash}`)
  }

  const userExists = await context.prisma.$exists.radioUser({
    radio: {id: radio.id},
    user: {id: userId}
  })

  if(!userExists){
    const radioUser = await context.prisma.createRadioUser({
      radio: {connect: {id: radio.id}},
      user: {connect: {id: userId}}
    })
  }

  return radio
}

async function sendMediaItem(parent, args, context, info){
  const userId = getUserId(context)
  const radio = await context.prisma.radio({id: args.radioId})

  if(!radio){
    throw new Error('Radio not found')
  }

  // verify this media item is not already present on queue or request list
  const mediaItemExists = await context.prisma.$exists.mediaItem({
    radio: {id: radio.id},
    externalId: args.externalId,
    source: args.source,
    status_in: ['QUEUED', 'REQUESTED']
  })

  // when it already exists
  if(mediaItemExists){
    throw new Error(`'${args.title}' is already queued in this radio`)
  }

  // initial status
  let status = 'QUEUED' // define by the radio type, some of them needs to be approved by owner

  const radioIsEmpty = ! await context.prisma.$exists.mediaItem({
    radio: {id: radio.id},
    status_in: ['QUEUED', 'NOW_PLAYING']
  })
  console.log("radioIsEmpty", radioIsEmpty)
  // when queue and now playing is empty, play the item
  if(radioIsEmpty){
    status = 'NOW_PLAYING'
  }

  // add to the radio
  return context.prisma.createMediaItem({
    radio: {connect: {id: radio.id}},
    sentBy: {connect: {id: userId}},
    externalId: args.externalId,
    source: args.source,
    title: args.title,
    thumbnailUrl: args.thumbnailUrl,
    channelTitle: args.channelTitle,
    publishedAt: args.publishedAt,
    status,
  })

}

const getRadioToManage = async (args, context) => {
  const fragment = `
    fragment RadioWithData on Radio {
      id
      hash
      createdBy {
        id
        name
      }
    }
  `
  const userId = getUserId(context)
  const radio = await context.prisma.radio({id: args.radioId}).$fragment(fragment)
  if (userId !== radio.createdBy.id){
    throw new Error('Only the radio owner can manage videos')
  }
  if(!radio){
    throw new Error('Radio not found')
  }
  return [userId, radio]
}

async function finish(parent, args, context, info){
  /*
  Player finished the args.mediaItemId and sets for the next item if args.playNext is true
   */
  const [userId, radio] = await getRadioToManage(args, context)
  const mediaItem = await context.prisma.updateMediaItem({
    where: {id: args.mediaItemId},
    data: {status: "PLAYED"}
  })

  if(args.playNext){
    const mediaItems = await context.prisma.mediaItems({
      where: {
        radio: {id: radio.id},
        status: "QUEUED"
      },
      first: 1
    })
    if(mediaItems.length > 0){
      let mediaItem = mediaItems[0]
      mediaItem = await context.prisma.updateMediaItem({
        where: {id: mediaItem.id},
        data: {status: "NOW_PLAYING"}
      })
      return mediaItem
    }

  }

  return null
}

async function play(parent, args, context, info){
  /*
  User hits play button on playlist
   */

  const [userId, radio] = await getRadioToManage(args, context)

  // currently NOW_PLAYING item, set to PLAYED
  await context.prisma.updateManyMediaItems({
    where: {
      radio: {id: radio.id},
      status: "NOW_PLAYING"
    },
    data: {status: 'PLAYED'}
  })

  // set the given item as now playing and return it
  // when the given item is null do nothing
  if(args.mediaItemId !== null){
    return context.prisma.updateMediaItem({
      where: {id: args.mediaItemId},
      data: {status: 'NOW_PLAYING'}
    })
  }
  return null
}

module.exports = {
  signup,
  anonymousSignup,
  login,
  createRadio,
  connectToRadio,
  sendMediaItem,
  play,
  finish,
}