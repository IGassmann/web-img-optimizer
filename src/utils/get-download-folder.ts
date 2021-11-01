import * as os from 'os'
import * as registry from 'registry-js'

function getDarwinDownloadFolder() {
  return `${process.env.HOME}/Downloads`
}

function getWindowsDownloadFolder() {
  let folder = `${process.env.USERPROFILE}\\Downloads`
  const folders = registry.enumerateValues(
    registry.HKEY.HKEY_CURRENT_USER,
    'Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders'
  )

  folders.forEach((value) => {
    if (value.name === '{374DE290-123F-4565-9164-39C4925E467B}') {
      if (typeof value.data === 'string') {
        folder = value.data.replace('%USERPROFILE%', process.env.USERPROFILE as string)
      }
    }
  })

  return folder
}

export default function getDownloadFolder(): string {
  const usersPlatform = os.platform()

  if (usersPlatform === 'darwin') return getDarwinDownloadFolder()
  if (usersPlatform === 'win32') return getWindowsDownloadFolder()

  return process.cwd()
}
