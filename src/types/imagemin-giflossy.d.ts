declare module 'imagemin-giflossy' {
  import { Plugin } from 'imagemin';

  function imageminGiflossy(options?: imageminGiflossy.Options): Plugin;

  namespace imageminGiflossy {
    interface Options {
      /**
       * false creates baseline JPEG file.
       * @default false
       */
      interlaced?: boolean;

      /**
       * Select an optimization level between 1 and 3.
       *
       * The optimization level determines how much optimization is done; higher levels take longer, but may have better results.
       *
       * 1. Stores only the changed portion of each image.
       * 2. Also uses transparency to shrink the file further.
       * 3. Try several optimization methods (usually slower, sometimes better results)
       * @default 1
       */
      optimizationLevel?: number;

      /**
       * Reduce the number of distinct colors in each output GIF to num or less. Num must be between 2 and 256.
       */
      colors?: number;

      /**
       * Order pixel patterns to create smaller GIFs at cost of artifacts and noise.
       *
       * Adjust lossy argument to quality you want (30 is very light compression, 200 is heavy).
       *
       * It works best when only little loss is introduced, and due to limitation of the compression algorithm very high loss levels won't give as much gain.
       * @default undefined
       */
      lossy?: number;

      /**
       * Resize the output GIF to widthxheight.
       * @default undefined
       */
      resize?: string;

      /**
       * Sets the output logical screen to the size of the largest output frame.
       * @default false
       */
      noLogicalScreen?: boolean;

      /**
       * Set the method used to resize images.
       * @default mix
       */
      resizeMethod?: string;

      /**
       * Determine how a smaller colormap is chosen.
       * @default diversity
       */
      colorMethod?: string;

      /**
       * Optimize output GIF animations for space.
       *
       * There are currently three levels:
       *
       * 1: Stores only the changed portion of each image. This is the default.
       * 2: Also uses transparency to shrink the file further.
       * 3: Try several optimization methods (usually slower, sometimes better results).
       * Other optimization flags provide finer-grained control.
       *
       * keep-empty: Preserve empty transparent frames (they are dropped by default).
       * @default 1
       */
      optimize?: string;

      /**
       * Unoptimize GIF animations into an easy-to-edit form.
       * @default false
       */
      unoptimize?: boolean;
    }
  }

  export = imageminGiflossy;
}
