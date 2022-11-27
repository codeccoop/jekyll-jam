import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Edit from "./pages/Edit";
import Settings from "./pages/Settings";
import MainLayout from "./layouts/main";

import Store from "./store";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/edit" element={<Edit />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" render={() => <Redirect path="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Store>
        <MainLayout>
          <AppRoutes />
        </MainLayout>
      </Store>
    </BrowserRouter>
  );
}

const root = createRoot(document.querySelector("#app"));
root.render(<App />);
