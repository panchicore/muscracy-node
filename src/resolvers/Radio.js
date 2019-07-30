function createdBy(parent, args, context) {
  return context.prisma.radio({ id: parent.id }).createdBy()
}

function people(parent, args, context) {
  return context.prisma.radio({ id: parent.id }).people()
}

function mediaItems(parent, args, context) {
  return context.prisma.radio({ id: parent.id }).mediaItems()
}

// function nowPlaying(parent, args, context) {
//   return context.prisma.radio({ id: parent.id }).nowPlaying()
// }



module.exports = {
  createdBy,
  people,
  mediaItems,
}