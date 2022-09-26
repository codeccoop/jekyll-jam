import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Edit from "./pages/Edit";
import MainLayout from "./layouts/main";

import { QueryParamsStore } from "./store/queryParams";
import { BranchStore } from "./store/branch";

import { init } from "./services/api";

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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    init().then(_ => setInitialized(true));
  }, []);

  return (
    <BrowserRouter>
      {initialized ? (
        <QueryParamsStore>
          <BranchStore>
            <MainLayout>
              <AppRoutes />
            </MainLayout>
          </BranchStore>
        </QueryParamsStore>
      ) : (
        void 0
      )}
    </BrowserRouter>
  );
}

const root = createRoot(document.querySelector("#app"));
root.render(<App />);
