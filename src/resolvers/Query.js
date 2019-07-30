async function users(parent, args, context, info) {
  return await context.prisma.users()
}

async function radios(parent, args, context, info) {
  return await context.prisma.radios()
}

async function mediaItems(parent, args, context, info) {
  const where = args.radioId ? {radio: {id: args.radioId}} : {}
  return await context.prisma.mediaItems({where})
}

const MEDIA = [
  {title: "Sworn Enemy - Prepare for the payback", id: "YT1", source: "youtube"},
  {title: "Diomedes Diaz - Los recuerdos de ella", id: "YT3", source: "youtube"},
  {title: "Bob Marley - No woman no cry", id: "YT2", source: "youtube"},
  {title: "Terror - Total Retaliation", id: "YT4", source: "youtube"},
].map(m => ({...m, exists: false}))

async function searchMedia(parent, args, context, info){
  let res = MEDIA.filter(m => {
    if(m.title.toLowerCase().search(args.filter.toLowerCase()) >= 0){
      return m
    }
  })

  if (args.radioId)
    res = res.map(async (m) => (
      {
        ...m, exists: await context.prisma.$exists.mediaItem(
          {source: m.source, externalId: m.id, radio: {id: args.radioId}},
        ),
      }
    ))

  return res
}

module.exports = {
  users,
  radios,
  searchMedia,
  mediaItems,
}