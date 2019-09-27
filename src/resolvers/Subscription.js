function radioMediaItemCreatedSubscription(parent, args, context, info) {
  return context.prisma.$subscribe.mediaItem({
    mutation_in: ['CREATED'],
    node: {radio: {id: args.radioId}}
  }).node()
}

function radioMediaItemUpdatedSubscription(parent, args, context, info) {
  return context.prisma.$subscribe.mediaItem({
    mutation_in: ['UPDATED'],
    updatedFields_contains: ['status'],
    node: {radio: {id: args.radioId}}
  }).node()
}

// function deletedLinkSubscribe(parent, args, context, info) {
//   return context.prisma.$subscribe.link({ mutation_in: ['DELETED'] }).previousValues()
// }

const radioMediaItemCreated = {
  subscribe: radioMediaItemCreatedSubscription,
  resolve: payload => {
    return payload
  },
}

const radioMediaItemUpdated = {
  subscribe: radioMediaItemUpdatedSubscription,
  resolve: payload => {
    return payload
  },
}



// const deletedLink = {
//   subscribe: deletedLinkSubscribe,
//   resolve: payload => {
//     return payload
//   },
// }
//
// function newVoteSubscribe(parent, args, context, info) {
//   return context.prisma.$subscribe.vote({ mutation_in: ['CREATED'] }).node()
// }
//
// const newVote = {
//   subscribe: newVoteSubscribe,
//   resolve: payload => {
//     return payload
//   },
// }

module.exports = {
  radioMediaItemCreated,
  radioMediaItemUpdated,
}