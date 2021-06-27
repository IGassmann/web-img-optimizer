import {Command, flags} from '@oclif/command'
import {cli} from 'cli-ux'
import {table} from 'cli-ux/lib/styled/table'
import * as puppeteer from 'puppeteer'
import {ImageElement} from '../types/image-element'
import customDevices from '../custom-device-descriptors'
import Columns = table.Columns
import Options = table.Options

export default class Dimensions extends Command {
  static description = 'Get the dimensions of all the rendered image elements.'

  static flags = {
    help: flags.help({char: 'h'}),
    ...cli.table.flags(),
  }

  static args = [{
    name: 'pageUrl',
    required: true,
    description: "Page's URL from where to get the image dimensions.",
  }]

  async run() {
    const {args, flags} = this.parse(Dimensions)

    if (!args.pageUrl) this.error('A web page URL is required for running the command', {exit: 22})

    cli.action.start('Loading browser')
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      timeout: 10000,
    })
    cli.action.stop()

    try {
      const page = await browser.newPage()

      await page.emulate(customDevices['Moto G4'])

      cli.action.start('Loading URL')
      page.once('load', () => cli.action.stop())
      await page.goto(args.pageUrl, {waitUntil: 'load', timeout: 60000})

      const images: ImageElement[] = await page.evaluate(
        () => {
          const imageElements = document.querySelectorAll<HTMLImageElement>('body img')
          return [...imageElements].map(({src, width, height, alt}) => {
            return {src, width, height, alt}
          })
        })

      const imagesWithDimensions = images.filter(image => image.height && image.width)

      const columns: Columns<typeof imagesWithDimensions[number]> = {
        width: {},
        height: {},
        src: {},
        alt: {extended: true},
      }

      const options: Options = {
        printLine: this.log,
        ...flags,
      }

      cli.table(imagesWithDimensions, columns, options)

      await browser.close()
    } catch (error) {
      browser.close()
      if (error.toString().includes('ERR_INTERNET_DISCONNECTED')) this.error('No internet')
      throw error
    }
  }
}
