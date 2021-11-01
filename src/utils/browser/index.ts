import os from 'os'
import { cli } from 'cli-ux'
import puppeteer, { PuppeteerNode } from 'puppeteer-core'
import { PUPPETEER_REVISIONS } from 'puppeteer-core/lib/cjs/puppeteer/revisions'
import customDevices from './custom-device-descriptors'
import DeviceType from './device-type'

export { default as DeviceType } from './device-type'

export default class HeadlessBrowser {
  private static startTimeout = 20_000

  private static pageWaitTimeout = 60_000

  private browser: puppeteer.Browser

  private constructor(browser: puppeteer.Browser) {
    this.browser = browser
  }

  static async launch(): Promise<HeadlessBrowser> {
    await downloadBrowser()
    cli.action.start('Launching browser')
    const launchedBrowser = await puppeteer.launch({
      args: ['--no-sandbox'],
      timeout: HeadlessBrowser.startTimeout,
    })
    cli.action.stop()

    return new HeadlessBrowser(launchedBrowser)
  }

  async openPage(url: string, deviceType: DeviceType): Promise<puppeteer.Page> {
    const page = await this.browser.newPage()

    let customDevice
    if (deviceType === DeviceType.MOBILE) {
      customDevice = customDevices['Moto G4']
    } else if (deviceType === DeviceType.DESKTOP) {
      customDevice = customDevices['Common Desktop']
    } else {
      customDevice = customDevices['Moto G4']
    }

    await page.emulate(customDevice)

    cli.action.start('Loading URL')
    page.once('load', () => cli.action.stop())
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: HeadlessBrowser.pageWaitTimeout,
    })

    return page
  }

  close(): void {
    this.browser.close()
  }
}

async function downloadBrowser(): Promise<void> {
  const browserFetcher = (puppeteer as unknown as PuppeteerNode).createBrowserFetcher({})

  const revision = PUPPETEER_REVISIONS.chromium
  await fetchBinary(revision)

  function fetchBinary(revision: string) {
    const revisionInfo = browserFetcher.revisionInfo(revision)

    // Do nothing if the revision is already downloaded.
    if (revisionInfo.local) {
      cli.log(`Browser is already in ${revisionInfo.folderPath}; skipping download.`)
      return
    }

    let progressBar: {
      start: (total: number) => void
      update: (currentValue: number) => void
      stop: () => void
    }
    function onProgress(downloadedBytes: number, totalBytes: number): void {
      if (!progressBar) {
        progressBar = cli.progress({
          format: 'Downloading browser... [{bar}] | {percentage}%',
        })
        progressBar.start(totalBytes)
      }
      progressBar.update(downloadedBytes)
    }

    function onSuccess(localRevisions: string[]): void {
      progressBar.stop()
      // Use Intel x86 builds on Apple M1 until native macOS arm64
      // Chromium builds are available.
      if (os.platform() !== 'darwin' && os.arch() !== 'arm64') {
        cli.log(`Browser (${revisionInfo.revision}) downloaded to ${revisionInfo.folderPath}`)
      }
      localRevisions = localRevisions.filter((revision) => revision !== revisionInfo.revision)
      const cleanupOldVersions = localRevisions.map((revision) => browserFetcher.remove(revision))
      Promise.all([...cleanupOldVersions])
    }

    function onError(error: NodeJS.ErrnoException): void {
      if (error.code === 'EACCES') {
        cli.error('Run command with "sudo" on the first run. Example: sudo wio preload...')
      } else {
        cli.error('Failed to set up browser!')
        console.error(error)
      }
      cli.exit(1)
    }

    return browserFetcher
      .download(revisionInfo.revision, onProgress)
      .then(() => browserFetcher.localRevisions())
      .then(onSuccess)
      .catch(onError)
  }
}
