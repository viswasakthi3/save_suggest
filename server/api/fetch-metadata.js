// server/api/fetch-metadata.js

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

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url

  if (!url) {
    return { error: 'URL is required' }
  }

  try {
    const { body: html, url: finalUrl } = await got(url)
    const metadata = await metascraper({ html, url: finalUrl })
    return { metadata }
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return { error: 'Failed to fetch metadata' }
  }
})


