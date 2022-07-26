import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Edit from "./pages/Edit";
import MainLayout from "./layouts/main";

import { QueryParams } from "./store/queryParams";

function Uploads() {}

function WareHouse() {}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/edit" element={<Edit />} />
      <Route path="/uploads" element={<Uploads />} />
      <Route path="/data" element={<WareHouse />} />
      <Route path="*" render={() => <Redirect path="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <QueryParams>
        <MainLayout>
          <AppRoutes />
        </MainLayout>
      </QueryParams>
    </BrowserRouter>
  );
}

const root = createRoot(document.querySelector("#app"));
root.render(<App />);
