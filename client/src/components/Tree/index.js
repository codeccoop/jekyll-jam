/* VENDOR */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "colmado";

/* SOURCE */
import { addFile, uploadFile, dropFile } from "./crud";
import { getTree } from "services/api";
import { getPathType, flattenTree, b64e } from "lib/helpers";

import File from "./File";

import "./style.scss";
import Directory from "./Directory";

function Tree() {
  const navigate = useNavigate();
  const location = useLocation();

  const [tree, setTree] = useState({
    placeholder: true,
    files: [
      { name: "index.md", children: [], sha: 1 },
      { name: "posts", children: [], sha: 2 },
      { name: "drafts", children: [], sha: 3 },
    ],
    data: [],
    media: [
      { name: "images", children: [], sha: 4 },
      { name: "documents", children: [], sha: 5 },
    ],
  });
  const [{ query, branch }, dispatch] = useStore();

  const [visibilities, setVisibilities] = useState({
    files: false,
    media: false,
    data: false,
  });

  function renderItemContent({ item, selected }, branch) {
    if (item.is_file) {
      return (
        <File
          sha={item.sha}
          path={item.path}
          name={item.name}
          isNew={item.sha === null}
          dropFile={(ev) => onDropFile(ev, item)}
        />
      );
    } else {
      return (
        <Directory
          {...item}
          isOpen={visibilities[item.path]}
          open={() => toggleVisibility(item.path)}
          addFile={(ev) => onAddFile(ev, branch, item.path)}
        >
          {renderList({ items: item.children, selected })}
        </Directory>
      );
    }
  }

  function renderItem({ item, selected }, branch) {
    const className =
      (item.is_file ? " file" : " directory") +
      (item.sha === selected ? " open" : "");

    return (
      <li key={item.sha} className={className}>
        {renderItemContent({ item, selected }, branch)}
      </li>
    );
  }

  function renderList({ items, selected }, branch) {
    return (
      <ul>{items.map((item) => renderItem({ item, selected }, branch))}</ul>
    );
  }

  function parseTree(tree) {
    return {
      sha: tree.sha,
      files: tree.children.filter(
        (d) => /^(_data|assets)/.test(d.path) === false
      ),
      data: tree.children.find((d) => d.name === "data")?.children || [],
      media: tree.children.find((d) => d.name === "assets")?.children || [],
    };
  }

  function fetchTree() {
    getTree(branch.sha)
      .then((tree) => {
        setTree(parseTree(tree));
        return tree;
      })
      .then((tree) => {
        if (!query.sha) return;

        const leaf = flattenTree(tree).find(
          (leaf) => b64e(leaf.path) === query.path
        );

        dispatch({
          action: "REFRESH_SHA",
          payload: leaf.sha,
        });
      });
  }

  function toggleVisibility(path, defaultValue) {
    const visibility =
      defaultValue !== void 0 ? defaultValue : !visibilities[path];
    setVisibilities({ ...visibilities, [path]: visibility });
  }

  useEffect(() => {
    if (!branch) return;
    if (branch.sha) fetchTree();
  }, [branch]);

  useEffect(() => {
    if (!tree || tree.placeholder || !query.path) return;

    const [path, pathType] = getPathType(query);
    const visibilityChanges = { [pathType]: true };
    path.split("/").reduce((acum, chunk) => {
      visibilityChanges[acum + chunk] = true;
      return acum + path + "/";
    }, "");
    setVisibilities({ ...visibilities, ...visibilityChanges });
  }, [tree]);

  function onAddFile(ev, branch, directory) {
    ev.preventDefault();
    ev.stopPropagation();

    toggleVisibility(branch, true);
    const type = branch === "files" ? "md" : branch === "data" ? "yml" : void 0;
    if (type === "md" || type === "yml") {
      setTree(addFile(tree, type, directory));
    } else {
      uploadFile(tree).then(({ tree, sha, path }) => {
        setTree(tree);

        dispatch({
          action: "FETCH_BRANCH",
        });

        if (!query.sha) {
          navigate(`/edit?sha=${sha}&path=${b64e(path)}`);
        } else {
          dispatch({
            action: "REFRESH_SHA",
            payload: sha,
          });
        }
      });
    }
  }

  function onDropFile(ev, item) {
    ev.preventDefault();
    ev.stopPropagation();

    dropFile(item).then(({ tree }) => {
      setTree(parseTree(tree));
      dispatch({
        action: "FETCH_BRANCH",
      });

      if (item.sha === query.sha) {
        navigate("/");
      }
    });
  }

  return (
    <nav className={"tree" + (tree.placeholder ? " loading" : "")}>
      <h3
        className={"branch" + (visibilities.files ? " open" : "")}
        onClick={() => toggleVisibility("files")}
      >
        Files
        <button
          className="create"
          onClick={(ev) => onAddFile(ev, "files")}
        ></button>
      </h3>
      {visibilities.files === true
        ? renderList(
            {
              items: tree.files,
              selected: query.sha,
            },
            "files"
          )
        : void 0}
      <h3
        className={"branch" + (visibilities.data ? " open" : "")}
        onClick={() => toggleVisibility("data")}
      >
        Data
        <button
          className="create"
          onClick={(ev) => onAddFile(ev, "data")}
        ></button>
      </h3>
      {visibilities.data === true
        ? renderList(
            {
              items: tree.data,
              selected: query.sha,
            },
            "data"
          )
        : void 0}
      <h3
        className={"branch" + (visibilities.media ? " open" : "")}
        onClick={() => toggleVisibility("media")}
      >
        Media
        <button
          className="upload"
          onClick={(ev) => onAddFile(ev, "media")}
        ></button>
      </h3>
      {visibilities.media === true
        ? renderList(
            {
              items: tree.media,
              selected: query.sha,
            },
            "media"
          )
        : void 0}
    </nav>
  );
}

export default Tree;
