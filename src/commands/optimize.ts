import { Command, flags } from '@oclif/command'
import { cli } from 'cli-ux'
import * as fs from 'fs'
import fetch from 'node-fetch'
import * as path from 'path'
import { ImageElement } from '../types/image-element'
import HeadlessBrowser, { DeviceType } from '../utils/browser'
import getDownloadFolder from '../utils/get-download-folder'
import isWebUrl from '../utils/is-web-url'
import OptimizableImage from '../utils/optimizable-image'

export default class Optimize extends Command {
  static description = 'Optimize all the rendered images.'

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = [
    {
      name: 'pageUrl',
      required: true,
      description: "Page's URL from where to optimize images.",
    },
  ]

  async run(): Promise<void> {
    const { args } = this.parse(Optimize)

    const imageElements = await this.getImageElements(args.pageUrl)

    if (imageElements.length === 0) {
      this.log('This page contains no image.')
      return
    }

    const outputDirectory = path.join(getDownloadFolder(), '/optimized-images/')

    // Reset output directory
    fs.rmdirSync(outputDirectory, { recursive: true })
    fs.mkdirSync(outputDirectory, { recursive: true })

    let index = 1

    const progressBar = cli.progress({
      format: 'Optimizing images... [{bar}] | {value}/{total}',
    })
    progressBar.start(imageElements.length)

    // Optimize images in parallel
    await Promise.all(
      imageElements.map(async (image) => {
        if (isWebUrl(image.src)) {
          const response = await fetch(image.src)
          const imageBuffer = await response.buffer()

          const optimizableImage = await OptimizableImage.fromBuffer(imageBuffer)
          await optimizableImage.optimize(image.width)

          const fileName = `image-${(index += 1)}.${optimizableImage.fileExtension}`
          fs.writeFileSync(path.join(outputDirectory, fileName), optimizableImage.toBuffer())
          progressBar.update(index - 1)
        }
      })
    )
    progressBar.stop()

    this.log('Optimized images available at:')
    await cli.url(outputDirectory, `file://${outputDirectory}`)
  }

  private async getImageElements(pageUrl: string): Promise<ImageElement[]> {
    const browser = await HeadlessBrowser.launch()
    let images: ImageElement[]
    try {
      const page = await browser.openPage(pageUrl, DeviceType.MOBILE)

      // Serializable function that is evaluated on the browser
      const getImageElements = () => {
        const imageElements = document.querySelectorAll<HTMLImageElement>('body img')
        return [...imageElements].map(({ src, width, height, alt }) => ({
          src,
          width,
          height,
          alt,
        }))
      }
      images = await page.evaluate(getImageElements)

      await browser.close()
    } catch (error: any) {
      browser.close()
      if (error.toString().includes('ERR_INTERNET_DISCONNECTED')) this.error('No internet')
      throw error
    }

    return Optimize.removeDuplicateImages(images)
  }

  private static removeDuplicateImages(images: ImageElement[]): ImageElement[] {
    return images.filter(
      (image, index, self) => index === self.findIndex((foundImage) => foundImage.src === image.src)
    )
  }
}
