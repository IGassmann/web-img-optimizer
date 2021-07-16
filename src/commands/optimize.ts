import { Command, flags } from '@oclif/command';
import { cli } from 'cli-ux';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as fileType from 'file-type';
import * as imagemin from 'imagemin';
import * as imageminMozjpeg from 'imagemin-mozjpeg';
import * as imageminGiflossy from 'imagemin-giflossy';
import imageminPngquant from 'imagemin-pngquant';
import * as imageminSvgo from 'imagemin-svgo';
import * as imageminZopfli from 'imagemin-zopfli';
import { ImageElement } from '../types/image-element';
import isWebUrl from '../utils/is-web-url';
import getDownloadFolder from '../utils/get-download-folder';
import customDevices from '../utils/browser/custom-device-descriptors';
import isSvg from 'is-svg';
import * as sharp from 'sharp';
import { extendDefaultPlugins } from 'svgo';

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

    cli.action.start('Loading browser');
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      timeout: 10000,
    });
    cli.action.stop();

    let images: ImageElement[];

    try {
      const page = await browser.newPage();

      await page.emulate(customDevices['Common Desktop']);

      cli.action.start('Loading URL');
      page.once('load', () => cli.action.stop());
      await page.goto(args.pageUrl, { waitUntil: 'load', timeout: 60000 });

      images = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLImageElement>('body img')].map(
          ({ src, width, height, alt }) => {
            return { src, width, height, alt };
          }
        )
      );

      await browser.close();
    } catch (error) {
      browser.close();
      if (error.toString().includes('ERR_INTERNET_DISCONNECTED')) this.error('No internet');
      throw error;
    }

    images = this.removeDuplicateImages(images);

    const optimizedImagesDirectory = path.join(getDownloadFolder(), '/optimized-images/');

    fs.rmdirSync(optimizedImagesDirectory, { recursive: true });
    fs.mkdirSync(optimizedImagesDirectory, { recursive: true });

    let index = 1;

    cli.progress;
    const progressBar = cli.progress({
      format: 'Optimizing images... [{bar}] | {value}/{total}',
    });
    progressBar.start(images.length);

    await Promise.all(
      images.map(async (image) => {
        if (isWebUrl(image.src)) {
          const response = await fetch(image.src);
          let imageBuffer = await response.buffer();

          const contentType = await fileType.fromBuffer(imageBuffer);
          const svgFileType = {
            mime: 'image/svg+xml',
            ext: 'svg',
          };
          const extendedContentType = isSvg(imageBuffer) ? svgFileType : contentType;

          if (extendedContentType) {
            if (
              image.width &&
              image.height &&
              extendedContentType?.mime !== 'image/svg+xml' &&
              extendedContentType?.mime !== 'image/gif'
            ) {
              imageBuffer = await sharp(imageBuffer, { failOnError: false })
                .resize({
                  width: image.width * 2,
                  withoutEnlargement: true,
                })
                .toBuffer();
            }

            const minifiedImageBuffer = await imagemin.buffer(imageBuffer, {
              plugins: [
                imageminPngquant({
                  quality: [0.65, 0.8],
                  strip: true,
                }),
                imageminZopfli({
                  more: true,
                }),
                imageminMozjpeg({
                  quality: 73,
                }),
                imageminGiflossy({
                  optimizationLevel: 3,
                  optimize: '3',
                  lossy: 80,
                }),
                imageminSvgo({
                  multipass: true,
                  plugins: extendDefaultPlugins(['convertStyleToAttrs', 'removeDimensions']),
                }),
              ],
            });

            const fileName = `image-${index++}.${extendedContentType?.ext}`;
            fs.writeFileSync(path.join(optimizedImagesDirectory, fileName), minifiedImageBuffer);
            progressBar.update(index - 1);
          }
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
