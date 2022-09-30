import React, { useEffect } from 'react';
import './style.scss';

import { useProject } from '../../store/project';

function HomePage() {
  const [project, setProject] = useProject();

  useEffect(() => {
    console.log(project);
  }, [project]);

  return (
    <>
      <h1 className='home__title'>{project.GH_REPO}</h1>
      <p className='home__welcome-message'>Welcome to Jekyll JAM Editor</p>
    </>
  );
}

export default HomePage;
