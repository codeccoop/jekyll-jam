import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import QueryParamsContext from "../../store/queryParams";
import { getBranch, getTree } from "../../services/api";

import "./style.scss";

function renderItemContent({ item, selected }) {
  if (item.is_file) {
    return (
      <Link
        id={item.sha}
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
        <span id={item.sha}>{item.name}</span>
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
  return <ul>{items.map(item => renderItem({ item, selected }))}</ul>;
}

export default function Sidebar({ toggleVisibility }) {
  const [tree, setTree] = useState({
    isBoilerplate: true,
    children: [
      { name: "index.md", children: [], sha: 1 },
      { name: "posts", children: [], sha: 2 },
      { name: "drafts", children: [], sha: 3 },
    ],
  });
  const [branch, setBranch] = useState(null);

  const [queryParams, setQueryParams] = useContext(QueryParamsContext);

  useEffect(() => {
    getBranch().then(setBranch);
  }, []);

  useEffect(() => {
    if (branch) getTree(branch["sha"]).then(setTree);
  }, [branch]);

  return (
    <nav className={"sidebar" + (tree.isBoilerplate ? " disabled" : "")}>
      <h3 className="title">
        Directory Tree<span onClick={toggleVisibility}>&laquo;</span>
      </h3>
      {renderList({
        items: tree.children,
        selected: queryParams.sha,
      })}
    </nav>
  );
}
