import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "colmado";

import "./style.scss";

import { init, postProject } from "../../services/api";
import Project from "../../components/Project";

const validateProject = (() => {
  const newProjectFields = [
    "GH_REPO",
    "GH_ACCESS_TOKEN",
    "GH_USER",
    "GH_EMAIL",
    "GH_DOMAIN",
    "GH_BRANCH",
    "GH_TEMPLATE",
  ];

  const existingModeFields = [
    "GH_REPO",
    "GH_ACCESS_TOKEN",
    "GH_USER",
    "GH_EMAIL",
    "GH_DOMAIN",
    "GH_BRANCH",
  ];

  return (project, mode) => {
    const projectFields = mode === "new" ? newProjectFields : existingModeFields;
    const fields = Array.apply(null, Object.keys(project)).filter(
      (field) => field !== "GH_INIT"
    );
    let isValid =
      fields.filter((f) => projectFields.indexOf(f) > -1).length === projectFields.length;

    isValid = fields.reduce((isValid, key) => {
      return isValid && typeof project[key] === "string" && project[key].length > 0;
    }, isValid);

    return Array.apply(
      null,
      document
        .querySelector(".vocero-project__form")
        .querySelectorAll(".vocero-project__field")
    ).reduce((isValid, node) => {
      return isValid && node.getAttribute("data-error") === "false";
    }, isValid);
  };
})();

function Init() {
  const [{ project }, dispatch] = useStore();
  const [isReady, setReady] = useState(false);
  const [mode, setMode] = useState("new");
  const navigate = useNavigate();

  useEffect(() => {
    if (project.GH_INIT) navigate("/");

    setReady(validateProject(project, mode));
  }, [project, mode]);

  function initProject() {
    postProject(project)
      .then((project) => {
        dispatch({
          action: "PATCH_PROJECT",
          payload: project,
        });
      })
      .then(() => init())
      .then(() => {
        window.location = "/";
      })
      .catch((err) => {
        console.error(err);
      });
  }

  return (
    <section className="page-content">
      <h1>Start your site!</h1>
      <div role="img" className="github-icon" aria-label="GitHub Icon" />
      <nav className="vocero-project__mode-selector">
        <ul>
          <li
            className={mode === "new" ? "active" : ""}
            data-mode="new"
            onClick={() => setMode("new")}
          >
            New site
          </li>
          <li
            className={mode === "existing" ? "active" : ""}
            data-mode="existing"
            onClick={() => setMode("existing")}
          >
            Existing site
          </li>
        </ul>
      </nav>
      <Project mode={mode} />
      <div className="init-actions">
        <button disabled={!isReady} onClick={initProject}>
          Create
        </button>
      </div>
    </section>
  );
}

export default Init;
