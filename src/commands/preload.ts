import { Command, flags } from '@oclif/command';
import { cli } from 'cli-ux';
import * as puppeteer from 'puppeteer';
import customDevices from '../custom-device-descriptors';

function calculateLargestImageElement() {
  const observer = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    const largestContentfulElement = lastEntry.element;
    if (largestContentfulElement instanceof HTMLImageElement) {
      window.largestImageElement = {
        src: largestContentfulElement.src,
        srcset: largestContentfulElement.srcset,
        sizes: largestContentfulElement.sizes,
      };
    }
  });

  observer.observe({ type: 'largest-contentful-paint', buffered: true });
}

export default class Preload extends Command {
  static description =
    'Generate the preload tag for the largest image visible within the initial viewport.';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  static args = [
    {
      name: 'pageUrl',
      required: true,
      description: "Page's URL to which generate the preload tag.",
    },
  ];

  async run() {
    const { args } = this.parse(Preload);

    if (!args.pageUrl)
      this.error('A web page URL is required for running the command', {
        exit: 22,
      });

    cli.action.start('Loading browser');
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      timeout: 10000,
    });
    cli.action.stop();

    try {
      const page = await browser.newPage();

      await page.emulate(customDevices['Moto G4']);

      await page.evaluateOnNewDocument(calculateLargestImageElement);

      cli.action.start('Loading URL');
      page.once('load', () => cli.action.stop());
      await page.goto(args.pageUrl, { waitUntil: 'load', timeout: 60000 });

      const largestImageElement = await page.evaluate(() => {
        return window.largestImageElement;
      });

      if (largestImageElement) {
        const { src, srcset, sizes } = largestImageElement;

        const preloadTag = `
<link rel="preload"
      href="${src}"${srcset && `
      imagesrcset="${srcset}"`}${sizes && `
      imagesizes="${sizes}"`}
      as="image"
>`;
        this.log("Add the following tag to the top of your page's head tag:\n", preloadTag);
      } else {
        this.log("No image to preload: the largest element isn't an image.");
      }

      browser.close();
    } catch (error) {
      browser.close();
      if (error.toString().includes('ERR_INTERNET_DISCONNECTED')) this.error('No internet');
      throw error;
    }
  }
}
