const BASE = "/api";

function request(
  endpoint,
  { method = "GET", data = null, headers = { "Accept": "application/json" } }
) {
  let path = `${BASE}/${endpoint}.php`;
  if (method === "GET") {
    path +=
      "?" +
      Object.keys(data)
        .filter(k => data[k] !== void 0)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`)
        .join("&");
    data = null;
  } else {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    method: method,
    headers: headers,
  };

  if (data) config.body = JSON.stringify(data);

  return fetch(path, config).then(res => res.json());
}

export function getBranch(branch_name) {
  return request("branch", { data: { name: branch_name } });
}

export function getTree(sha) {
  return request("tree", { data: { sha: sha } });
}

export function getBlob(sha) {
  return request("blob", { data: { sha: sha } });
}

export function postCommit({ path, content, sha }) {
  return request("commit", { method: "POST", data: { path, content, blob: sha } });
}

export function postPull() {
  return request("pull", { method: "POST" });
}
