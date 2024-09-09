import { createRequire } from 'module'
import got from 'got'

const require = createRequire(import.meta.url)
const metascraper = require('metascraper')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])
require('dotenv').config()

// YouTube API Key (loaded from .env file)
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

// Helper function to ex

// Helper function to extract the video ID from a YouTube URL
function extractYouTubeVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

// Function to fetch metadata from the YouTube Data API
async function fetchYouTubeMetadata(videoId) {
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet`
  const response = await got(apiUrl, { responseType: 'json' })
  const videoData = response.body.items[0].snippet

  // Return metadata with the YouTube thumbnail as the image
  return {
    title: videoData.title,
    description: videoData.description,
    image: videoData.thumbnails.high.url, // Use the YouTube thumbnail as the image
    publishedAt: videoData.publishedAt,
    channelTitle: videoData.channelTitle
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url

  if (!url) {
    return { error: 'URL is required' }
  }

  // Check if the URL is a YouTube URL
  const videoId = extractYouTubeVideoId(url)
  if (videoId) {
    try {
      // Fetch metadata from the YouTube Data API
      const metadata = await fetchYouTubeMetadata(videoId)
      return { metadata }
    } catch (error) {
      console.error('Error fetching YouTube metadata:', error)
      return { error: 'Failed to fetch YouTube metadata' }
    }
  }

  // If it's not a YouTube URL, use metascraper to fetch metadata
  try {
    const { body: html, url: finalUrl } = await got(url)
    const metadata = await metascraper({ html, url: finalUrl })
    return { metadata }
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return { error: 'Failed to fetch metadata' }
  }
})
