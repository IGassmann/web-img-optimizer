declare global {
  interface Window {
    largestImageElement: {
      src: string;
      srcset: string;
      sizes: string;
    };
  }
  interface PerformanceEntry {
    element: HTMLUnknownElement;
  }
}

export {}
