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
  const radio = await context.prisma.createRadio({
    hash: args.hash,
    createdBy: { connect: { id: userId } },
  })
  return radio
}

async function connectToRadio(parent, args, context, info){
  const userId = getUserId(context)
  const radio = await context.prisma.radio({hash: args.hash})

  if(!radio){
    throw new Error('Radio not found')
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

  const mediaItemExists = await context.prisma.$exists.mediaItem({
    radio: {id: radio.id},
    externalId: args.externalId,
    source: args.source
  })

  if(mediaItemExists){
    throw new Error('It already exists')
  }

  const mediaItem = await context.prisma.createMediaItem({
    radio: {connect: {id: radio.id}},
    sentBy: {connect: {id: userId}},
    externalId: args.externalId,
    source: args.source,
    title: args.title,
  })

  return mediaItem
}

async function play(parent, args, context, info){
  const userId = getUserId(context)
  const radio = await context.prisma.radio({id: args.radioId})

  if(!radio){
    throw new Error('Radio not found')
  }

  // currently playing
  // let currentlyPlayingExist = await context.prisma.$exists.mediaItem({
  //   radio: {id: radio.id},
  //   status: 'NOW_PLAYING'
  // })
  // if exist, set as played
  // if (currentlyPlayingExist){
  //   let currentlyPlaying = await context.prisma.mediaItem({
  //     radio: {id: radio.id},
  //     status: 'NOW_PLAYING'
  //   })
  //   currentlyPlaying.status = 'PLAYED'
  //   await context.prisma.updateMediaItem(currentlyPlaying)
  // }


  // get the item to be played
  let mediaItemToPlay = await context.prisma.mediaItem({
    id: args.mediaItemId
  })

  // set as now playing and return
  mediaItemToPlay.status = 'NOW_PLAYING'
  return await context.prisma.updateMediaItem(mediaItemToPlay, {id: args.mediaItemId})
  // return mediaItemToPlay

}

module.exports = {
  signup,
  login,
  createRadio,
  connectToRadio,
  sendMediaItem,
  play,
}