import { Command, flags } from '@oclif/command';
import { cli } from 'cli-ux';
import * as puppeteer from 'puppeteer';
import customDevices from '../custom-device-descriptors';
import { ImageElement } from '../types/image-element';

function calculateLargestImageElement() {
  const observer = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    const largestContentfulElement = lastEntry.element;
    if (largestContentfulElement instanceof HTMLImageElement) {
      const { src, srcset, sizes } = largestContentfulElement;
      window.largestImageElement = { src, srcset, sizes };
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

    cli.action.start('Loading browser');
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      timeout: 10_000,
    });
    cli.action.stop();

    try {
      const page = await browser.newPage();

      await page.emulate(customDevices['Moto G4']);

      await page.evaluateOnNewDocument(calculateLargestImageElement);

      cli.action.start('Loading URL');
      page.once('load', () => cli.action.stop());
      await page.goto(args.pageUrl, { waitUntil: 'load', timeout: 60_000 });

      const largestImageElement = await page.evaluate(() => {
        return window.largestImageElement;
      });

      if (largestImageElement) {
        this.printPreloadTag(largestImageElement);
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

  private printPreloadTag(largestImageElement: ImageElement) {
    const { src, srcset, sizes } = largestImageElement;

    const preloadTag = `\n<link rel="preload"\n      href="${src}"${
      srcset && `\n      imagesrcset="${srcset}"`
    }${sizes && `\n      imagesizes="${sizes}"`}\n      as="image"\n>`;
    this.log("Add the following tag to the top of your page's head tag:\n", preloadTag);
  }
}
