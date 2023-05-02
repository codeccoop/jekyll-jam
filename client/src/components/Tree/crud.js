/* SOURCE */
import { dropBlob } from "services/api";
import { getPathType } from "lib/helpers";

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

  let parent = null;
  return [
    directory
      .split("/")
      .filter((chunk) => chunk)
      .filter((chunk) => ["_data", "assets"].indexOf(chunk) === -1)
      .reduce((siblings, pathChunk) => {
        const node = siblings.find(
          (sibling) => sibling.path.split("/").pop() === pathChunk
        );
        parent = node;
        return node.children;
      }, branch),
    parent,
  ];
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
            getSiblings(tree, "media", directory)[0]
          );
          res({
            content: window.btoa(reader.result),
            path: newFile.path,
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

  const [siblings] = getSiblings(tree, type, directory);
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

export function dropFile({ sha, path }) {
  return dropBlob({ sha, path });
}

export function addLeaf(tree, leaf) {
  const [path, branch] = getPathType(leaf);
  const type = branch === "files" ? "md" : branch === "data" ? "yml" : "media";
  const [siblings, parent] = getSiblings(
    tree,
    type,
    path.split("/").slice(0, -1).join("/")
  );
  const newSiblings = siblings
    .filter((sibling) => sibling.sha !== null)
    .concat({
      sha: leaf.sha,
      name: path.split("/").pop(),
      path: path,
      is_file: true,
      children: [],
    });
  if (parent) {
    parent.children = newSiblings;
  } else {
    tree[branch] = newSiblings;
  }
  return { ...tree, [branch]: tree[branch] };
}

export function dropLeaf(tree, leaf) {
  const [path, branch] = getPathType(leaf);
  const type = branch === "files" ? "md" : branch === "data" ? "yml" : "media";
  const [siblings, parent] = getSiblings(
    tree,
    type,
    path.split("/").slice(0, -1).join("/")
  );
  const newSiblings = siblings.filter((sibling) => sibling.sha !== leaf.sha);

  if (parent) {
    parent.children = newSiblings;
  } else {
    tree[branch] = newSiblings;
  }

  return { ...tree, [branch]: tree[branch] };
}
