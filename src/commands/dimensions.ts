import { Command, flags } from '@oclif/command';
import { cli } from 'cli-ux';
import { table } from 'cli-ux/lib/styled/table';
import { ImageElement } from '../types/image-element';
import HeadlessBrowser, { DeviceType } from '../utils/browser';

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

  async run(): Promise<void> {
    const { args } = this.parse(Dimensions);

    const browser = await HeadlessBrowser.launch();

    try {
      const page = await browser.openPage(args.pageUrl, DeviceType.MOBILE);

      // Serializable function that is evaluated on the browser
      const getImageElements = () => {
        const imageElements = document.querySelectorAll<HTMLImageElement>('body img');
        return [...imageElements].map(({ src, naturalWidth, naturalHeight, alt }) => ({
          src,
          width: naturalWidth,
          height: naturalHeight,
          alt,
        }));
      };
      const images: ImageElement[] = await page.evaluate(getImageElements);
      browser.close();

      const imagesWithDimensions = images.filter((image) => image.width && image.height);

      if (imagesWithDimensions.length !== 0) {
        this.printImageDimensions(imagesWithDimensions);
      } else {
        this.log('This page contains no image.');
      }
    } catch (error) {
      browser.close();
      if (error.toString().includes('ERR_INTERNET_DISCONNECTED')) this.error('No internet.');
      throw error;
    }
  }

  private printImageDimensions(imagesWithDimensions: ImageElement[]) {
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
