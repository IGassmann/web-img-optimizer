import { Command, Flags } from '@oclif/core'
import { ImageElement } from '../types/image-element'
import HeadlessBrowser, { DeviceType } from '../utils/browser'

export default class Preload extends Command {
  static description =
    'Generate the preload tag for the largest image visible within the initial viewport.'

  static flags = {
    help: Flags.help({ char: 'h' }),
  }

  static args = [
    {
      name: 'pageUrl',
      required: true,
      description: "Page's URL to which generate the preload tag.",
    },
  ]

  async run(): Promise<void> {
    const { args } = await this.parse(Preload)

    const browser = await HeadlessBrowser.launch()

    try {
      const page = await browser.openPage(args.pageUrl, DeviceType.MOBILE)

      // Serializable function that is evaluated on the browser
      const getLargestImageElement = (): ImageElement | undefined => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const observer = new PerformanceObserver(() => {})
        observer.observe({ type: 'largest-contentful-paint', buffered: true })

        const records = observer.takeRecords()
        const lastEntry = records[records.length - 1]
        const largestContentfulElement = lastEntry.element

        if (largestContentfulElement instanceof HTMLImageElement) {
          const { src, srcset, sizes } = largestContentfulElement
          return { src, srcset, sizes }
        }
        return undefined
      }
      const largestImageElement = await page.evaluate(getLargestImageElement)
      browser.close()

      if (largestImageElement) {
        this.printPreloadTag(largestImageElement)
      } else {
        this.log('No image to preload. The largest element isn’t an image.')
      }
    } catch (error: any) {
      browser.close()
      if (error.toString().includes('ERR_INTERNET_DISCONNECTED')) this.error('No internet.')
      throw error
    }
  }

  private printPreloadTag(largestImageElement: ImageElement) {
    const { src, srcset, sizes } = largestImageElement

    const preloadTag = `\n<link rel="preload"\n      href="${src}"${
      srcset && `\n      imagesrcset="${srcset}"`
    }${sizes && `\n      imagesizes="${sizes}"`}\n      as="image"\n>`
    this.log("Add the following tag to the top of your page's head tag:\n", preloadTag)
  }
}
