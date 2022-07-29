import React, { useState, useEffect } from "react";

import { useQueryParams } from "../../store/queryParams";
import { useBranch } from "../../store/branch";
import { getTree, postPull } from "../../services/api";

import "./style.scss";
import Directory from "../Directory";

function Sidebar({ toggleVisibility }) {
  const [tree, setTree] = useState({
    isBoilerplate: true,
    children: [
      { name: "index.md", children: [], sha: 1 },
      { name: "posts", children: [], sha: 2 },
      { name: "drafts", children: [], sha: 3 },
    ],
  });
  const [branch, setBranch] = useBranch();
  const [queryParams, setQueryParams] = useQueryParams();

  useEffect(() => {
    if (branch.sha) getTree(branch["sha"]).then(setTree);
  }, [branch.ahead_by]);

  function publish() {
    postPull().then(console.log).catch(console.error);
  }

  return (
    <div className="sidebar">
      <div className="sidebar__head">
        <h2>
          {branch["repo"] || "REPO NAME"}
          <span onClick={toggleVisibility}>&laquo;</span>
        </h2>
      </div>
      <Directory />
      <div className="sidebar__bottom">
        <a className={"btn" + (branch.ahead_by > 0 ? "" : " disabled")} onClick={publish}>
          Publish
        </a>
      </div>
    </div>
  );
}

export default Sidebar;
