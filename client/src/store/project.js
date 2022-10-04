import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getProject } from '../services/api.js';

export const ProjectContext = createContext({});

export function ProjectStore({ children }) {
  const [state, setState] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    getProject().then(setState);
  }, []);

  useEffect(() => {
    if (state.GH_INIT !== void 0 && !state.GH_INIT) {
      navigate('/settings');
    }
  }, [state]);

  return (
    <ProjectContext.Provider value={state}>
      {state !== null ? children : void 0}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}

export default ProjectContext;
