import React, { useEffect, useState } from "react";
import "./style.scss";

import { useStore } from "colmado";
import { getConfig } from "../../services/api";

import YamlForm from "../../components/YamlForm";

function Settings() {
  const [{ project, branch }] = useStore();
  const [config, setConfig] = useState(null);
  const setReady = useState(false)[1];

  useEffect(() => {
    if (branch?.sha === void 0) return;
    getConfig(branch.sha).then(setConfig);
  }, [branch?.sha]);

  useEffect(() => {
    if (project === null) return;
    setReady(true);
  }, [project?.GH_REPO]);

  function updateProject(ev) {}

  function updateConfig(config) {}

  return (
    <>
      <h1>Settings</h1>
      <h2>GitHub</h2>
      <label>User</label>
      <input
        type="text"
        value={project.GH_USER || ""}
        name="GH_USER"
        onChange={updateProject}
      />
      <label>Email</label>
      <input
        type="text"
        value={project.GH_EMAIL || ""}
        name="GH_EMAIL"
        onChange={updateProject}
      />
      <label>Repo</label>
      <input
        type="text"
        value={project.GH_REPO || ""}
        name="GH_REPO"
        onChange={updateProject}
      />
      <label>Branch</label>
      <input
        type="text"
        value={project.GH_BRANCH || ""}
        name="GH_BRANCH"
        onChange={updateProject}
      />
      <label>Domain</label>
      <input
        type="text"
        value={project.GH_DOMAIN || ""}
        name="GH_DOMAIN"
        onChange={updateProject}
      />
      <h2>Jekyll Config</h2>
      <YamlForm content={config} onUpdate={updateConfig} />
    </>
  );
}

export default Settings;
