/* VENDOR */
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

/* SOURCE */
import Home from "pages/Home";
import Edit from "pages/Edit";
import Settings from "pages/Settings";
import Init from "pages/Init";
import MainLayout from "layouts/main";
import { useStore } from "colmado";

import Store from "store";
import LexicalContext from "lib/contexts/Lexical";

function Spinner() {
  return <h1>Loading...</h1>;
}

function ProtectedRoute({ children }) {
  const [{ project }] = useStore();

  if (!project.GH_INIT) {
    return <Navigate to="/init" />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/init" element={<Init />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit"
        element={
          <ProtectedRoute>
            <Edit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="*" render={() => <Redirect path="/" />} />
    </Routes>
  );
}

function App() {
  const [{ project }] = useStore();

  return (
    <BrowserRouter basename={process.env.BASE_URL}>
      <LexicalContext>
        <Store>
          <MainLayout>{project ? <AppRoutes /> : <Spinner />}</MainLayout>
        </Store>
      </LexicalContext>
    </BrowserRouter>
  );
}

const root = createRoot(document.querySelector("#app"));
root.render(<App />);
