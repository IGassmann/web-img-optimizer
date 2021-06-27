export interface ImageElement {
  /**
   * The address or URL of the media resource that is to be considered.
   */
  src: string;

  /**
   * The width of the object.
   */
  width: number;

  /**
   * The height of the object.
   */
  height: number;

  /**
   * A text alternative to the graphic.
   */
  alt?: string;

  /**
   * A comma-separated list of one or more image candidate strings to be used when determining
   * which image resource to present
   */
  srcset?: string;

  /**
   * A comma-separated list of source size descriptors followed by an optional fallback size.
   */
  sizes?: string;
}
