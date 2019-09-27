const querystring = require("querystring")

const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"

const API_KEY = process.env.YOUTUBE_API_KEY

function createVideo(item) {
    return {
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.default.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        source: 'youtube',
        exists: false
    };
}

async function apiSearch(q) {
    // https://panchicore.d.pr/uQS1g6
    const params = {
        part: "snippet",
        type: "video",
        key: API_KEY,
        q: q,
        maxResults: 10
    }
    let response = await fetch(`${SEARCH_URL}?${querystring.stringify(params)}`)
    return await response.json()
}

async function apiSearchRelated(videoId) {
    // https://panchicore.d.pr/uQS1g6

      const params = {
        part: "snippet",
        type: "video",
        key: API_KEY,
        relatedToVideoId: videoId,
        maxResults: 20
    }
    let response = await fetch(`${SEARCH_URL}?${querystring.stringify(params)}`)
    return await response.json()
}

async function youtubeVideoSearch(q){
    const results = await apiSearch(q)
    if(results.hasOwnProperty('items')){
        return results.items.map(createVideo)
    }else{
        throw new Error(results.error.message)
    }

}

async function youtubeVideoSearchRelated(videoId){
    const results = await apiSearchRelated(videoId)
    if(results.hasOwnProperty('items')){
        return results.items.map(createVideo)
    }else{
        throw new Error(results.error.message)
    }
}

module.exports = {
    apiSearch,
    youtubeVideoSearch,
    youtubeVideoSearchRelated,
}