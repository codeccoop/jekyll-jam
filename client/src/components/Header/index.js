import React from "react";
import { useNavigate } from "react-router-dom";

import "./style.scss";

export default function Header() {
  const navigate = useNavigate();
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
        Jekyll JAM
      </div>
    </header>
  );
}
