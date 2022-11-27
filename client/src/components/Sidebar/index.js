import React from "react";
import { useNavigate } from "react-router-dom";

// import { useStore } from "../../store";
import { useStore } from "colmado";

import "./style.scss";
import Directory from "../Directory";

function Sidebar({ toggleVisibility }) {
  const navigate = useNavigate();
  const [{ branch, project }] = useStore();

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
          className={"btn" + (branch.ahead_by > 0 ? "" : " disabled")}
          onClick={goSettings}
        >
          Settings
        </a>
        <a className="btn" onClick={openSite}>
          View site
        </a>
        <a className="btn" onClick={downloadBuild}>
          Download
        </a>
      </div>
    </div>
  );
}

export default Sidebar;
