import { Command, flags } from '@oclif/command';
import { cli } from 'cli-ux';
import { table } from 'cli-ux/lib/styled/table';
import HeadlessBrowser, { DeviceType } from '../utils/browser';
import { ImageElement } from '../types/image-element';

export default class Dimensions extends Command {
  static description = 'Get the dimensions of all the rendered image elements.';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  static args = [
    {
      name: 'pageUrl',
      required: true,
      description: "Page's URL from where to get the image dimensions.",
    },
  ];

  async run() {
    const { args } = this.parse(Dimensions);

    const browser = await HeadlessBrowser.launch();

    try {
      const page = await browser.openPage(args.pageUrl, DeviceType.MOBILE);

      // Serializable function that is evaluated on the browser
      const getImageElements = () => {
        const imageElements = document.querySelectorAll<HTMLImageElement>('body img');
        return [...imageElements].map(({ src, width, height, alt }) => {
          return { src, width, height, alt };
        });
      };
      const images: ImageElement[] = await page.evaluate(getImageElements);

      const imagesWithDimensions = images.filter((image) => image.height && image.width);

      this.outputImageDimensions(imagesWithDimensions);

      browser.close();
    } catch (error) {
      browser.close();
      if (error.toString().includes('ERR_INTERNET_DISCONNECTED')) this.error('No internet');
      throw error;
    }
  }

  private outputImageDimensions(imagesWithDimensions: ImageElement[]) {
    const columns: table.Columns<typeof imagesWithDimensions[number]> = {
      width: {},
      height: {},
      src: {},
    };

    const options: table.Options = {
      printLine: this.log,
      'no-truncate': true,
    };

    cli.table(imagesWithDimensions, columns, options);
  }
}
