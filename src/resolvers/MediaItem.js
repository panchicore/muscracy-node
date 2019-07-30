function radio(parent, args, context){
  return context.prisma.mediaItem({id: parent.id}).radio()
}

function sentBy(parent, args, context){
  return context.prisma.mediaItem({id: parent.id}).sentBy()
}

module.exports = {
  radio,
  sentBy,
}