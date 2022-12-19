const BASE = "/rs";

function request(
  endpoint,
  { method = "GET", data = null, headers = { "Accept": "application/json" } }
) {
  let path = `${BASE}/${endpoint}.php`;
  if (method === "GET") {
    if (data !== null) {
      path +=
        "?" +
        Object.keys(data)
          .filter((k) => data[k] !== void 0)
          .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`)
          .join("&");
      data = null;
    }
  } else {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    method: method,
    headers: headers,
  };

  if (data) config.body = JSON.stringify(data);

  const req = fetch(path, config);
  if (headers["Accept"] === "application/json") {
    return req.then((res) => res.json());
  }

  return req;
}

export function getProject() {
  return request("project", {});
}

export function getConfig(sha) {
  return request("config", { data: { sha } });
}

export function getStyleURL(sha) {
  return request("style", { data: { sha } });
}

export function init() {
  return request("init", {});
}

export function getBranch(branch_name) {
  return request("branch", { data: { name: branch_name } });
}

export function getTree(sha) {
  return request("tree", { data: { sha: sha } });
}

export function getBlob({ sha, path }) {
  return request("blob", { data: { sha, path } });
}

export function commit(changes) {
  const data = changes.map(({ path, content }) => ({ path, content }));
  return request("commit", { method: "POST", data });
}

export function postPull() {
  return request("pull", { method: "POST" });
}

export function getWorkflow() {
  return request("workflow", { method: "GET" });
}

export function observeWorkflow(interval = 5e3, timeout = 3e2) {
  const start = Date.now();
  let time_delta = 0;

  return new Promise((res, rej) => {
    function abort(msg = "Timeout error") {
      rej(new Error(msg));
    }

    function observe() {
      time_delta = (start - Date.now()) / 1e3;
      if (time_delta <= timeout) {
        getWorkflow()
          .then((data) => {
            if (data.status === "completed") {
              if (data.conclusion === "success") res(data);
              else abort(data);
            } else if (data.status === "error") {
              abort(data);
            } else {
              setTimeout(observe, interval);
            }
          })
          .catch(() => setTimeout(observe, interval));
      } else abort();
    }

    observe();
  });
}

export function getArtifact() {
  return request("artifact", {
    method: "GET",
    headers: { "Accept": "application/zip" },
  }).then((res) => res.blob());
}
