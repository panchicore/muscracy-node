

function user(parent, args, context) {
  return context.prisma.radioUser({ id: parent.id }).user()
}


module.exports = {
  user
}