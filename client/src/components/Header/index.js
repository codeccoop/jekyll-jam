import { useStore } from "colmado";
import React from "react";
import { useNavigate } from "react-router-dom";

import "./style.scss";

export default function Header() {
  const navigate = useNavigate();
  const [{ project }] = useStore();
  function goHome() {
    navigate("/");
  }

  return (
    <header className="header">
      <div onClick={goHome} className="brand">
        <picture className="brand-logo">
          <source srcSet="static/images/app-logo.webp" type="image/webp" />
          <img src="static/images/app-logo.png" type="image/png" />
        </picture>
        Vocero
      </div>
      <div className="site-name">
        <p>{project.GH_REPO}</p>
      </div>
    </header>
  );
}
