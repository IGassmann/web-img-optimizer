import { Device } from 'puppeteer-core'

const devices: Device[] = [
  {
    name: 'Moto G4',
    userAgent:
      'Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36',
    viewport: {
      width: 360,
      height: 640,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },
  {
    name: 'Common Desktop',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
    viewport: {
      width: 1280,
      height: 720,
      deviceScaleFactor: 2,
      isMobile: false,
      hasTouch: false,
      isLandscape: false,
    },
  },
]

export type CustomDevicesMap = {
  [name: string]: Device
}

const customDevicesMap: CustomDevicesMap = {}

devices.forEach((device) => {
  customDevicesMap[device.name] = device
})

export default customDevicesMap
