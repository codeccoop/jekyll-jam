import React, { useState, useEffect } from "react";

import { useStore } from "colmado";
import { getTree } from "../../services/api";

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

  const [visibilities, setVisibilities] = useState({});

  function newFile(type) {
    if (type === "markdown") {
      const children = tree.children.concat({
        path: "new_file.md",
        name: "new_file.md",
        children: [],
        sha: 0,
        is_file: true,
      });
      setTree({ ...tree, ...{ children } });
    } else if (type === "yaml") {
      const data = tree.data.concat({
        path: "data/new_file.yml",
        name: "new_file.yml",
        children: [],
        sha: 0,
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
          is_new={item.sha === 0}
          fetchTree={fetchTree}
        />
      );
    } else {
      return (
        <>
          <span
            className={"directory" + (visibilities[item.path] ? " open" : "")}
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
        children: data.children.filter((d) => ["data", "assets"].indexOf(d.name) === -1),
        data: data.children.find((d) => d.name === "data")?.children || [],
        assets: data.children.find((d) => d.name === "assets")?.children || [],
      });
    });
  }

  useEffect(() => {
    if (branch?.sha) {
      fetchTree();
    }
  }, [branch?.ahead_by]);

  function toggleVisibility(path) {
    setVisibilities({ ...visibilities, [path]: !visibilities[path] });
  }

  return (
    <nav className={"directory" + (tree.isBoilerplate ? " loading" : "")}>
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
      {visibilities.data
        ? renderList({
            items: tree.data,
            selected: query.sha,
          })
        : void 0}
      <h3
        className={"title" + (visibilities.assets ? " open" : "")}
        onClick={() => toggleVisibility("assets")}
      >
        Assets<a className="upload" onClick={() => uploadFile("asset")}></a>
      </h3>
      {visibilities.assets
        ? renderList({
            items: tree.assets,
            selected: query.sha,
          })
        : void 0}
    </nav>
  );
}

export default Directory;
