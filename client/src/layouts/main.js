import React, { useState } from "react";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

import "./style.scss";

export default function MainLayout({ children }) {
  const [sidebarVisibility, setSidebarVisibility] = useState(true);

  return (
    <div className={"app__content" + (sidebarVisibility ? "" : " fullscreen")}>
      <Header />
      <Sidebar toggleVisibility={() => setSidebarVisibility(!sidebarVisibility)} />
      <main className={location.pathname.slice(1) + " page"}>{children}</main>
    </div>
  );
}
