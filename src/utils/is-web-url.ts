const isWebUrl = (string: string) => /(http(s?)):\/\//i.test(string);

export default isWebUrl;
