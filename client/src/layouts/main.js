import React, { useState } from "react";
import { useLocation } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

import "./style.scss";

export default function MainLayout({ children }) {
  const [sidebarVisibility, setSidebarVisibility] = useState(true);
  const location = useLocation();

  return (
    <div className={"app__content" + (sidebarVisibility ? "" : " fullscreen")}>
      <Header />
      <Sidebar toggleVisibility={() => setSidebarVisibility(!sidebarVisibility)} />
      <main className={(location.pathname.slice(1) || "home") + " page"}>{children}</main>
    </div>
  );
}
