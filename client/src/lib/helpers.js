export function uuid() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 5);
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
}

export function b64e(str) {
  return encodeURIComponent(window.btoa(str));
}

export function b64d(str) {
  return window.atob(decodeURIComponent(str));
}
