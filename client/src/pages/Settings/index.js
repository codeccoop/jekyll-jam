import React, { useEffect, useState } from "react";
import "./style.scss";

import { useStore } from "colmado";
import { getConfig } from "../../services/api";

import YamlForm from "../../components/YamlForm";
import Project from "../../components/Project";

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

  function updateProject(ev) {
    // TODO
  }

  function updateConfig(config) {
    // TODO
  }

  return (
    <>
      <h1>Project Settings</h1>
      <Project mode="existing" />
      <h2>Jekyll Config</h2>
      <YamlForm content={config} onUpdate={updateConfig} />
    </>
  );
}

export default Settings;
