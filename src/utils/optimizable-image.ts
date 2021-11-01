import imageType from 'image-type'
import isSvg from 'is-svg'
import sharp from 'sharp'
import svgo from 'svgo'

interface ImageTypeResult {
  /**
   The detected file extension.
   */
  fileExtension: string

  /**
   The detected [MIME type](https://en.wikipedia.org/wiki/Internet_media_type).
   */
  mime: string
}

export default class OptimizableImage {
  private static readonly supportedMIMETypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
  ] as const

  private constructor(
    private buffer: Buffer,
    private readonly mimeType: typeof OptimizableImage.supportedMIMETypes[number],
    public readonly fileExtension: string
  ) {}

  public static async fromBuffer(buffer: Buffer): Promise<OptimizableImage> {
    const contentType = await this.getImageType(buffer)

    if (!contentType) throw new Error('Could not parse file type')

    const isSupported = (this.supportedMIMETypes as readonly string[]).includes(contentType.mime)
    if (!isSupported) {
      throw new Error(
        `Expected the \`buffer\` argument to be one of MIME types \`${this.supportedMIMETypes.toString()}\`, got \`${
          contentType.mime
        }\``
      )
    }

    return new OptimizableImage(
      buffer,
      contentType.mime as OptimizableImage['mimeType'],
      contentType.fileExtension
    )
  }

  public async optimize(width?: number): Promise<void> {
    if (width) await this.resize(width)
    await this.minify()
  }

  private async resize(width: number): Promise<void> {
    if (this.mimeType !== 'image/svg+xml') {
      this.buffer = await sharp(this.buffer, { failOnError: false })
        .resize({
          width: width * 2,
          withoutEnlargement: true,
        })
        .toBuffer()
    }
  }

  private async minify(): Promise<void> {
    if (this.mimeType === 'image/svg+xml') {
      const { data } = svgo.optimize(this.buffer.toString())
      this.buffer = Buffer.from(data)
    } else {
      this.buffer = await sharp(this.buffer)
        .jpeg({
          mozjpeg: true,
          quality: 73,
        })
        .png({
          quality: 80,
        })
        .webp()
        .toBuffer()
    }
  }

  public toBuffer(): Buffer {
    return this.buffer
  }

  private static async getImageType(imageBuffer: Buffer): Promise<ImageTypeResult | null> {
    if (isSvg(imageBuffer)) {
      return {
        mime: 'image/svg+xml',
        fileExtension: 'svg',
      }
    }
    const imageTypeResult = imageType(imageBuffer)
    if (!imageTypeResult) return null
    return { mime: imageTypeResult.mime, fileExtension: imageTypeResult.ext }
  }
}
