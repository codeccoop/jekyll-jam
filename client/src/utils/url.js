import { b64d } from "utils";

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
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("=");
}

export function encodeQuery(query) {
  return Object.entries(query)
    .map((e) => e.map(encodeURIComponent).join("="))
    .join("&");
}

export function getPathType({ path }) {
  const parsed = b64d(path);

  if (/^assets/.test(parsed)) {
    return [parsed, "media"];
  } else if (/^_data/.test(parsed)) {
    return [parsed, "data"];
  } else {
    return [parsed, "files"];
  }
}
