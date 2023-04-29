/* SOURCE */
import { dropBlob, commit } from "services/api";
import { b64e } from "lib/helpers";

function setUnique(file, siblings) {
  const tocayo = siblings.find((sibling) => sibling.path === file.path);
  if (tocayo) {
    const ext = /\.\w+$/.test(file.path)
      ? "." + file.path.split(".").pop()
      : "";
    file.path = file.path.replace(/\.\w+$/, `_copy${ext}`);
    file.name = file.path.split("/").pop();

    return setUnique(file, siblings);
  }

  return file;
}

function getSiblings(tree, type, directory) {
  const branchName =
    type === "md" ? "files" : type === "yml" ? "data" : "media";
  const branch = tree[branchName];

  return directory
    .split("/")
    .filter((chunk) => chunk)
    .filter((chunk) => ["_data", "assets"].indexOf(chunk) === -1)
    .reduce((siblings, pathChunk) => {
      return siblings.find(
        (sibling) => sibling.path.split("/").pop() === pathChunk
      ).children;
    }, branch);
}

export function uploadFile(tree, directory = "assets") {
  return new Promise((res, rej) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accet", "image/*,video/*");
    input.addEventListener("input", (ev) => {
      if (ev.target.files.length === 0) rej("No files selecteds");
      const file = ev.target.files[0];
      const reader = new FileReader();
      reader.onloadend = function (ev) {
        if (ev.target.readyState == FileReader.DONE) {
          const newFile = setUnique(
            {
              name: file.name,
              path: `${directory}/${file.name}`.replace(/\/+/, "/"),
            },
            getSiblings(tree, "media", directory)
          );
          commit([
            {
              content: window.btoa(reader.result),
              path: b64e(newFile.path),
              encoding: "base64",
              frontmatter: [],
            },
          ]).then((commit) => {
            const blob = commit.changes[0];
            res({
              tree: addFile(tree, "media", directory, {
                name: blob.path.split("/").pop(),
                path: blob.path,
                sha: blob.sha,
                is_file: true,
                children: [],
              }),
              sha: commit.changes[0].sha,
              path: blob.path,
            });
          });
        }
      };
      reader.readAsBinaryString(file);
      document.body.removeChild(input);
    });
    document.body.append(input);
    input.click();
  });
}

export function addFile(tree, type, directory = "", newFile = null) {
  newFile = newFile || {
    path: `${directory}/new_file.${type}`
      .replace(/^\/+/, "")
      .replace(/\/+/, "/"),
    name: `new_file.${type}`,
    children: [],
    is_file: true,
    sha: null,
  };

  const siblings = getSiblings(tree, type, directory);
  siblings.push(setUnique(newFile, siblings));

  switch (type) {
    case "md":
      return { ...tree, ...{ children: tree.children } };
    case "yml":
      return { ...tree, ...{ data: tree.data } };
    case "media":
      return { ...tree, ...{ media: tree.media } };
  }
}

export function createFile(file) {
  return commit([
    {
      content: "",
      path: b64e(file.path),
      frontmatter: [],
      encoding: "base64",
    },
  ]);
}

export function dropFile({ sha, path }) {
  return dropBlob({ sha, path });
}
