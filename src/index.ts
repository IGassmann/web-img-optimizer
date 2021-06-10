import {Command, flags} from '@oclif/command'
import * as puppeteer from 'puppeteer'
import * as fs from 'fs'
import * as path from 'path'
import { URL } from 'url';
import * as https from 'https'
import tinify from 'tinify'
import {optimize} from 'svgo'
import svgoConfig from './svgo.config'
import isWebUrl from './is-web-url';

class WebImgOptimizer extends Command {
  static description = 'describe the command here'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    // flag with a value (-k, --tinyPngApiKey=VALUE)
    tinyPngApiKey: flags.string({
      char: 'k',
      description: 'TinyPNG API key',
      default: 'Q3x26dQ92TgPlGs2k1VQYZxxccnDpjVP',
    }),
  }

  static args = [{name: 'pageUrl'}]

  async run() {
    const {args, flags} = this.parse(WebImgOptimizer)

    tinify.key = flags.tinyPngApiKey

    const browser = await puppeteer.launch({
      defaultViewport: {
        width: 2000,
        height: 1000,
        deviceScaleFactor: 2,
      },
    })
    const context = await browser.createIncognitoBrowserContext()
    const page = await context.newPage()

    await page.goto(args.pageUrl)

    const images = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLImageElement>('body img')].map(({src, width, height}) => {
        return {src, width, height}
      })
    )
    this.log('Loaded images:', images)
    await browser.close()

    const originalImagesDirectory = './dist/original/'
    const optimizedImagesDirectory = './dist/optimized/'

    fs.rmdirSync('./dist/', {recursive: true})
    fs.mkdirSync(originalImagesDirectory, {recursive: true})
    fs.mkdirSync(optimizedImagesDirectory, {recursive: true})

    let index = 1;
    images.forEach(image => {
      if (isWebUrl(image.src)) {
        https.get(image.src, response => {
          const contentType = response.headers['content-type'];

          let fileExtension;
          if (contentType === 'image/svg+xml') fileExtension = '.svg';
          if (contentType === 'image/jpeg') fileExtension = '.jpg';
          if (contentType === 'image/png') fileExtension = '.png';

          const fileName = 'image-' + index++ + fileExtension

          const stream = response.pipe(fs.createWriteStream(originalImagesDirectory + fileName))

          stream.on('finish', async function () {
            if (contentType === 'image/svg+xml') {
              const svg = fs.readFileSync(originalImagesDirectory + fileName, 'utf8')

              const optimizedSVG = optimize(svg, svgoConfig)

              if (optimizedSVG.data.length < svg.length) {
                fs.writeFileSync(optimizedImagesDirectory + fileName, optimizedSVG.data)
              }
            }

            if (contentType === 'image/jpeg' || contentType === 'image/png') {
              const rasterImageBuffer = fs.readFileSync(originalImagesDirectory + fileName)
              let source = tinify.fromBuffer(rasterImageBuffer)
              if (image.width && image.height) {
                source = source.resize({
                  method: 'fit',
                  width: image.width * 2,
                  height: image.height * 2,
                })
              }
              const result = source.result();

              const sourceSize = rasterImageBuffer.length;
              const resultSize = await result.size();
              if (resultSize < sourceSize) {
                source.toFile(optimizedImagesDirectory + fileName)
              }
            }
          })
        })
      }
    })
  }
}

export = WebImgOptimizer
