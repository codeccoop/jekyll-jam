export function uuid() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substring(0, 5);
}

export function encodeQuery(query) {
  return Object.entries(query)
    .map((e) => e.map(encodeURIComponent).join("="))
    .join("&");
}

export function b64e(str) {
  if (!str) return str;
  return window.btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode("0x" + p1);
    })
  );
}

export function b64d(str) {
  if (!str) return str;
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

export function flattenTree(tree) {
  function gatherChildrens(node) {
    if (!node.children || node.children.length === 0) return [];
    return node.children.reduce((children, child) => {
      return children.concat(child, ...gatherChildrens(child));
    }, []);
  }

  return gatherChildrens(tree);
}
