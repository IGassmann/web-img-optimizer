import { ImageElement } from './image-element';

declare global {
  interface Window {
    largestImageElement: ImageElement;
  }
  interface PerformanceEntry {
    element: HTMLUnknownElement;
  }
}

export {};
