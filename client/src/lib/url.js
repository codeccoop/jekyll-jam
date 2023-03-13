export function parseQueryParams() {
  return location.search
    .slice(1)
    .split("&")
    .reduce((acum, item) => {
      return { ...acum, ...Object.fromEntries([item.split("=")]) };
    }, {});
}

export function stringifyQueryParams(params) {
  return Object.keys(params)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("=");
}
