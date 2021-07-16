import puppeteer from 'puppeteer';
import { cli } from 'cli-ux';
import DeviceType from './device-type';
import customDevices from './custom-device-descriptors';

export { default as DeviceType } from './device-type';

export default class HeadlessBrowser {
  private static startTimeout = 10_000;

  private static pageWaitTimeout = 60_000;

  private browser: puppeteer.Browser;

  private constructor(browser: puppeteer.Browser) {
    this.browser = browser;
  }

  static async launch(): Promise<HeadlessBrowser> {
    cli.action.start('Loading browser');
    const loadedBrowser = await puppeteer.launch({
      args: ['--no-sandbox'],
      timeout: HeadlessBrowser.startTimeout,
    });
    cli.action.stop();

    return new HeadlessBrowser(loadedBrowser);
  }

  async openPage(url: string, deviceType: DeviceType): Promise<puppeteer.Page> {
    const page = await this.browser.newPage();

    let customDevice;
    if (deviceType === DeviceType.MOBILE) {
      customDevice = customDevices['Moto G4'];
    } else if (deviceType === DeviceType.DESKTOP) {
      customDevice = customDevices['Common Desktop'];
    } else {
      customDevice = customDevices['Moto G4'];
    }

    await page.emulate(customDevice);

    cli.action.start('Loading URL');
    page.once('load', () => cli.action.stop());
    await page.goto(url, { waitUntil: 'load', timeout: HeadlessBrowser.pageWaitTimeout });

    return page;
  }

  close(): void {
    this.browser.close();
  }
}
