const isWebUrl = (string: string) => {
  const webProtocols = ['http', 'https']
  try {
    const url = new URL(string)
    return webProtocols ?
      url.protocol ?
        webProtocols.map(webProtocol => `${webProtocol.toLowerCase()}:`).includes(url.protocol) :
        false :
      true
  } catch (error) {
    return false
  }
}

export default isWebUrl
