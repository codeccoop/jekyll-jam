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

  return (
    <>
      <h1>Settings</h1>
      <h2>GitHub</h2>
      <label>User</label>
      <input type="text" value={project?.GH_USER} />
      <label>Email</label>
      <input type="text" value={project?.GH_EMAIL} />
      <label>Repo</label>
      <input type="text" value={project?.GH_REPO} />
      <label>Branch</label>
      <input type="text" value={project?.GH_BRANCH} />
      <label>Domain</label>
      <input type="text" value={project?.GH_DOMAIN} />
      <h2>Jekyll</h2>
      <YamlForm content={config} />
    </>
  );
}

export default Settings;
