const puppeteer = require('puppeteer')
const revisions = require('puppeteer/lib/cjs/puppeteer/revisions')

if (!process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD) return

let platform = process.env.npm_config_platform
if (platform === 'win32') platform = 'win64'

const browserFetcher = puppeteer.createBrowserFetcher({ platform })

browserFetcher.download(revisions.PUPPETEER_REVISIONS.chromium)
