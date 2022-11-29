import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useStore } from "colmado";

import "./style.scss";
import Directory from "../Directory";
import { commit, observeWorkflow } from "../../services/api";

function Sidebar({ toggleVisibility }) {
  const navigate = useNavigate();
  const [{ branch, project, changes }, dispatch] = useStore();
  const [isBuilding, setIsBuilding] = useState(false);

  function goSettings() {
    navigate("/settings");
  }

  function openSite() {
    if (project.GH_DOMAIN === "repo") {
      window.open(`https://${project.GH_USER}.github.io/${project.GH_REPO}`);
    } else {
      window.open("https://" + project.GH_DOMAIN);
    }
  }

  function downloadBuild() {}

  function commitChanges() {
    commit(changes).then((commit) => {
      const changeMap = changes.reduce((acum, from) => {
        return acum.concat([
          [from.sha, commit.changes.find((to) => to.path === atob(from.path)).sha],
        ]);
      }, []);
      dispatch({
        action: "CLEAR_CHANGES",
      });
      dispatch({
        action: "REFRESH_SHA",
        payload: changeMap,
      });
      setIsBuilding(true);
      observeWorkflow().finally(() => {
        setIsBuilding(false);
      });
    });
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
        <a
          className="btn"
          disabled={branch.ahead_by > 0 ? "" : " disabled"}
          onClick={goSettings}
        >
          Settings
        </a>
        <a className="btn" onClick={openSite}>
          View site
        </a>
        <a className="btn" disabled={isBuilding} onClick={downloadBuild}>
          Download
        </a>
        <a
          className="btn"
          disabled={isBuilding}
          data-changes={(changes || []).length}
          onClick={commitChanges}
        >
          Publish
        </a>
      </div>
    </div>
  );
}

export default Sidebar;
