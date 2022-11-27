import React from "react";
import "./style.scss";

import { useStore } from "colmado";

function HomePage() {
  const [{ project }] = useStore();

  return (
    <>
      <h1 className="home__title">{project.GH_REPO}</h1>
      <p className="home__welcome-message">Welcome to Jekyll JAM Editor</p>
    </>
  );
}

export default HomePage;
