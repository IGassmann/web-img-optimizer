import * as fileType from 'file-type';
import imagemin from 'imagemin';
import imageminGiflossy from 'imagemin-giflossy';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminSvgo from 'imagemin-svgo';
import imageminZopfli from 'imagemin-zopfli';
import isSvg from 'is-svg';
import sharp from 'sharp';
import { extendDefaultPlugins } from 'svgo';

export default class OptimizableImage {
  private buffer: Buffer;

  public contentType: { ext: string; mime: string } | undefined;

  private constructor(imageBuffer: Buffer, contentType: { ext: string; mime: string } | undefined) {
    this.buffer = imageBuffer;
    this.contentType = contentType;
  }

  public static async fromBuffer(imageBuffer: Buffer): Promise<OptimizableImage> {
    const contentType = await this.getContentType(imageBuffer);

    return new OptimizableImage(imageBuffer, contentType);
  }

  public async optimize(
    imageWidth: number | undefined,
    imageHeight: number | undefined
  ): Promise<void> {
    await this.resize(imageWidth, imageHeight);
    await this.minify();
  }

  public toBuffer(): Buffer {
    return this.buffer;
  }

  private async resize(
    imageWidth: number | undefined,
    imageHeight: number | undefined
  ): Promise<void> {
    if (!(await this.isResizable(this.buffer, imageWidth, imageHeight))) {
      return;
    }

    this.buffer = await sharp(this.buffer, { failOnError: false })
      .resize({
        width: (imageWidth as number) * 2,
        withoutEnlargement: true,
      })
      .toBuffer();
  }

  private async isResizable(
    imageBuffer: Buffer,
    imageWidth: number | undefined,
    imageHeight: number | undefined
  ): Promise<boolean> {
    if (!imageWidth || !imageHeight) return false;

    const contentType = this.contentType;

    return contentType?.mime !== 'image/svg+xml' && contentType?.mime !== 'image/gif';
  }

  private static async getContentType(
    imageBuffer: Buffer
  ): Promise<{ ext: string; mime: string } | undefined> {
    const contentType = await fileType.fromBuffer(imageBuffer);
    const svgFileType = {
      mime: 'image/svg+xml',
      ext: 'svg',
    };
    return isSvg(imageBuffer) ? svgFileType : contentType;
  }

  private async minify(): Promise<void> {
    this.buffer = await imagemin.buffer(this.buffer, {
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
  }
}
