import { Command, flags } from '@oclif/command';
import { cli } from 'cli-ux';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';
import OptimizableImage from '../utils/optimizable-image';
import { ImageElement } from '../types/image-element';
import HeadlessBrowser, { DeviceType } from '../utils/browser';
import getDownloadFolder from '../utils/get-download-folder';
import isWebUrl from '../utils/is-web-url';

export default class Optimize extends Command {
  static description = 'Optimize all the rendered images.';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  static args = [
    {
      name: 'pageUrl',
      required: true,
      description: "Page's URL from where to optimize images.",
    },
  ];

  async run() {
    const { args } = this.parse(Optimize);

    const browser = await HeadlessBrowser.launch();

    let images: ImageElement[];
    try {
      const page = await browser.openPage(args.pageUrl, DeviceType.MOBILE);

      // Serializable function that is evaluated on the browser
      const getImageElements = () => {
        const imageElements = document.querySelectorAll<HTMLImageElement>('body img');
        return [...imageElements].map(({ src, width, height, alt }) => {
          return { src, width, height, alt };
        });
      };
      images = await page.evaluate(getImageElements);

      await browser.close();
    } catch (error) {
      browser.close();
      if (error.toString().includes('ERR_INTERNET_DISCONNECTED')) this.error('No internet');
      throw error;
    }

    const uniqueImages = this.removeDuplicateImages(images);

    const optimizedImagesDirectory = path.join(getDownloadFolder(), '/optimized-images/');

    fs.rmdirSync(optimizedImagesDirectory, { recursive: true });
    fs.mkdirSync(optimizedImagesDirectory, { recursive: true });

    let index = 1;

    const progressBar = cli.progress({
      format: 'Optimizing images... [{bar}] | {value}/{total}',
    });
    progressBar.start(uniqueImages.length);

    // Optimize images in parallel
    await Promise.all(
      uniqueImages.map(async (image) => {
        if (isWebUrl(image.src)) {
          const response = await fetch(image.src);
          const imageBuffer = await response.buffer();

          const optimizableImage = await OptimizableImage.fromBuffer(imageBuffer);
          await optimizableImage.optimize(image.width, image.height);

          const fileName = `image-${index++}.${optimizableImage.contentType?.ext}`;
          fs.writeFileSync(
            path.join(optimizedImagesDirectory, fileName),
            optimizableImage.toBuffer()
          );
          progressBar.update(index - 1);
        }
      })
    );
    progressBar.stop();

    this.log('Optimized images available at:');
    await cli.url(optimizedImagesDirectory, `file://${optimizedImagesDirectory}`);
  }

  private removeDuplicateImages(images: ImageElement[]): ImageElement[] {
    return images.filter((image, index, self) => {
      return index === self.findIndex((foundImage) => foundImage.src === image.src);
    });
  }
}
