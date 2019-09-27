function createdBy(parent, args, context) {
  return context.prisma.radio({ id: parent.id }).createdBy()
}

function people(parent, args, context) {
  return context.prisma.radio({ id: parent.id }).people()
}

function itemsPlaying(parent, args, context) {
  return context.prisma.radio({ id: parent.id }).mediaItems({
    where: {status: 'NOW_PLAYING'}
  })
}

function itemsQueued(parent, args, context) {
  return context.prisma.radio({ id: parent.id }).mediaItems({
    where: {status: 'QUEUED'}
  })
}

function itemsPlayed(parent, args, context){
  return context.prisma.radio({ id: parent.id }).mediaItems({
    where: {status: 'PLAYED'},
    orderBy: 'sentAt_DESC',
    first: 20
  })
}

module.exports = {
  createdBy,
  people,
  itemsPlayed,
  itemsPlaying,
  itemsQueued
}