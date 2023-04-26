export function uuid() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substring(0, 5);
  // return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
  //   (
  //     c ^
  //     (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
  //   ).toString(16)
  // );
}

export function b64e(str) {
  return window.btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode("0x" + p1);
    })
  );
}

export function b64d(str) {
  return decodeURIComponent(
    window
      .atob(str)
      .split("")
      .map((c) => {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
}
