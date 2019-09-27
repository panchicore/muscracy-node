const {youtubeVideoSearch, youtubeVideoSearchRelated} = require("../lib/youtube-api-search")

async function users(parent, args, context, info) {
  return await context.prisma.users()
}

async function radios(parent, args, context, info) {
  return await context.prisma.radios()
}

async function radio(parent, args, context, info) {
  const radio = await context.prisma.radio({id: args.id})
  if (radio === null){
    throw new Error("Radio does not exist")
  }
  return radio
}

async function searchMedia(parent, args, context, info){

  let results = null
  if(args.filter.startsWith("related to:")){
    const videoId = args.filter.split(":")[1].trim()
    results = await youtubeVideoSearchRelated(videoId)
  }else{
    results = await youtubeVideoSearch(args.filter)

  }

  // verify if the result already exist in the radio
  if (args.radioId)
    results = results.map(async (m) => (
      {
        ...m, exists: await context.prisma.$exists.mediaItem(
          {
            source: m.source,
            externalId: m.id,
            radio: {id: args.radioId},
            status_in: ["QUEUED", "REQUESTED"]
            },
        ),
      }
    ))
  return results
}

module.exports = {
  users,
  radio,
  radios,
  searchMedia,
}