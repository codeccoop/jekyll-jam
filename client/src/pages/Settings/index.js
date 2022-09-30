import React, { useEffect, useState } from 'react';
import './style.scss';

import { useProject } from '../../store/project';
import { useBranch } from '../../store/branch';
import { getConfig } from '../../services/api';

import YamlForm from '../../components/YamlForm';

function Settings() {
  const [project, setProject] = useProject(null);
  const [branch, setBranch] = useBranch(null);
  const [config, setConfig] = useState(null);
  const [ready, setReady] = useState(false);

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
      {ready ? <h2>{project.GH_REPO}</h2> : void 0}
      <YamlForm content={config} />
    </>
  );
}

export default Settings;
