const isWebUrl = (urlString: string): boolean => /(http(s?)):\/\//i.test(urlString);

export default isWebUrl;
