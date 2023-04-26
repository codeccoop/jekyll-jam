/* VENDOR */
import React, { useState, useEffect } from "react";
import { useStore } from "colmado";

/* SOURCE */
import { getTree } from "services/api";
import { b64d } from "lib/helpers";

import File from "./File";

import "./style.scss";

function Directory() {
  const [tree, setTree] = useState({
    isBoilerplate: true,
    children: [
      { name: "index.md", children: [], sha: 1 },
      { name: "posts", children: [], sha: 2 },
      { name: "drafts", children: [], sha: 3 },
    ],
    data: [],
    assets: [
      { name: "images", children: [], sha: 4 },
      { name: "documents", children: [], sha: 5 },
    ],
  });
  const [{ query, branch }] = useStore();

  const [visibilities, setVisibilities] = useState({
    children: false,
    assets: false,
    data: false,
  });

  function newFile(type) {
    const [path, pathType] = parseQueryPathType(query);
    // TODO: place children on current directory
    if (type === "markdown") {
      const children = tree.children.concat({
        path: "new_file.md",
        name: "new_file.md",
        children: [],
        sha: null,
        is_file: true,
      });
      setTree({ ...tree, ...{ children } });
    } else if (type === "yaml") {
      const data = tree.data.concat({
        path: "data/new_file.yml",
        name: "new_file.yml",
        children: [],
        sha: null,
        is_file: true,
      });
      setTree({ ...tree, ...{ data } });
    }
  }

  function renderItemContent({ item, selected }) {
    if (item.is_file) {
      return (
        <File
          sha={item.sha}
          path={item.path}
          name={item.name}
          is_new={item.sha === null}
          fetchTree={fetchTree}
        />
      );
    } else {
      return (
        <>
          <span
            className={
              "directory-cover" + (visibilities[item.path] ? " open" : "")
            }
            id={item.sha}
            onClick={() => toggleVisibility(item.path)}
          >
            {item.name}
          </span>
          {renderList({ items: item.children, selected })}
        </>
      );
    }
  }

  function renderItem({ item, selected }) {
    const className =
      "item" +
      (item.sha === selected ? " open" : "") +
      (item.is_file ? " file" : " directory");

    return (
      <li key={item.sha} className={className}>
        {renderItemContent({ item, selected })}
      </li>
    );
  }

  function renderList({ items, selected }) {
    return <ul>{items.map((item) => renderItem({ item, selected }))}</ul>;
  }

  function fetchTree() {
    getTree(branch.sha).then((data) => {
      setTree({
        sha: data.sha,
        children: data.children.filter(
          (d) => /^(_data|assets)/.test(d.path) === false // ["data", "assets"].indexOf(d.name) === -1
        ),
        data: data.children.find((d) => d.name === "data")?.children || [],
        assets: data.children.find((d) => d.name === "assets")?.children || [],
      });
    });
  }

  function toggleVisibility(path) {
    setVisibilities({ ...visibilities, [path]: !visibilities[path] });
  }

  function parseQueryPathType({ path }) {
    const parsed = b64d(path);

    if (/^assets/.test(parsed)) {
      return [parsed, "assets"];
    } else if (/^_data/.test(parsed)) {
      return [parsed, "data"];
    } else {
      return [parsed, "children"];
    }
  }

  useEffect(() => {
    if (!branch) return;
    if (branch.sha) fetchTree();
  }, [branch]);

  useEffect(() => {
    if (!tree || tree.isBoilerplate || !query.path) return;

    const [path, pathType] = parseQueryPathType(query);
    const visibilityChanges = { [pathType]: true };
    path.split("/").reduce((acum, chunk) => {
      visibilityChanges[acum + chunk] = true;
      return acum + path + "/";
    }, "");
    setVisibilities({ ...visibilities, ...visibilityChanges });
  }, [tree]);

  return (
    <nav className={"tree" + (tree.isBoilerplate ? " loading" : "")}>
      <h3
        className={"title" + (visibilities.children ? " open" : "")}
        onClick={() => toggleVisibility("children")}
      >
        Files<a className="create" onClick={() => newFile("markdown")}></a>
      </h3>
      {visibilities.children === true
        ? renderList({
            items: tree.children,
            selected: query.sha,
          })
        : void 0}
      <h3
        className={"title" + (visibilities.data ? " open" : "")}
        onClick={() => toggleVisibility("data")}
      >
        Data<a className="create" onClick={() => newFile("yaml")}></a>
      </h3>
      {visibilities.data === true
        ? renderList({
            items: tree.data,
            selected: query.sha,
          })
        : void 0}
      <h3
        className={"title" + (visibilities.assets ? " open" : "")}
        onClick={() => toggleVisibility("assets")}
      >
        Media<a className="upload" onClick={() => uploadFile("asset")}></a>
      </h3>
      {visibilities.assets === true
        ? renderList({
            items: tree.assets,
            selected: query.sha,
          })
        : void 0}
    </nav>
  );
}

export default Directory;
