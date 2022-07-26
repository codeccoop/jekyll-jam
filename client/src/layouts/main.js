import React from "react";
import { useLocation } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }) {
  const location = useLocation();

  return (
    <>
      <Header />
      <Sidebar />
      <main className={location.pathname.slice(1) + "-page"}>{children}</main>
    </>
  );
}
