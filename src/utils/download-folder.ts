import * as os from 'os'
import * as registry from 'registry-js'

function darwin() {
  return `${process.env.HOME}/Downloads`
}

function windows() {
  let folder = `${process.env.USERPROFILE}\\Downloads`
  const folders =
    registry.enumerateValues(
      registry.HKEY.HKEY_CURRENT_USER,
      'Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders')
  for (const value of folders) {
    if (value.name === '{374DE290-123F-4565-9164-39C4925E467B}') {
      if (typeof value.data === 'string') {
        folder = value.data.replace('%USERPROFILE%', process.env.USERPROFILE as string)
      }
      break
    }
  }
  return folder
}

export default function downloadFolder(): string {
  const usersPlatform = os.platform()

  if (usersPlatform === 'darwin') return darwin()
  if (usersPlatform === 'win32') return windows()
  return process.cwd()
}
