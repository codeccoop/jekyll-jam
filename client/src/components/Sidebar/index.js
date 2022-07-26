import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { getBranch, getTree } from "../../services/api";

import "./style.css";

function renderItemContent(item) {
  if (item.is_file) {
    return (
      <Link
        to={
          "/edit?sha=" +
          encodeURIComponent(item.sha) +
          "&path=" +
          encodeURIComponent(btoa(item.path))
        }
      >
        {item.name}
      </Link>
    );
  } else {
    return (
      <>
        <span>{item.name}</span>
        {renderList(item.children)}
      </>
    );
  }
}

function renderItem(item) {
  return <li key={item.sha}>{renderItemContent(item)}</li>;
}

function renderList(items) {
  return <ul>{items.map(renderItem)}</ul>;
}

export default function Navbar() {
  const [tree, setTree] = useState({
    isBoilerplate: true,
    children: [
      { name: "index.md", children: [], sha: 1 },
      { name: "posts", children: [], sha: 2 },
      { name: "drafts", children: [], sha: 3 },
    ],
  });
  const [branch, setBranch] = useState(null);
  const location = useLocation();

  useEffect(() => {
    getBranch().then(setBranch);
  }, []);

  useEffect(() => {
    if (branch) getTree(branch["sha"]).then(setTree);
  }, [branch]);

  return (
    <nav className={"sidebar" + (tree.isBoilerplate ? " disabled" : "")}>
      <h3>Directory Tree</h3>
      {renderList(tree.children)}
    </nav>
  );
}
