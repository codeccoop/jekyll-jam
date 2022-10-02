import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from './pages/Home';
import Edit from './pages/Edit';
import Settings from './pages/Settings';
import MainLayout from './layouts/main';

import { QueryParamsStore } from './store/queryParams';
import { ProjectStore } from './store/project';
import { BranchStore } from './store/branch';

// import { init } from './services/api';

function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/edit' element={<Edit />} />
      <Route path='/settings' element={<Settings />} />
      <Route path='*' render={() => <Redirect path='/' />} />
    </Routes>
  );
}

function App() {
  // const [initialized, setInitialized] = useState(false);

  return (
    <BrowserRouter>
      <QueryParamsStore>
        <ProjectStore>
          <BranchStore>
            <MainLayout>
              <AppRoutes />
            </MainLayout>
          </BranchStore>
        </ProjectStore>
      </QueryParamsStore>
    </BrowserRouter>
  );
}

const root = createRoot(document.querySelector('#app'));
root.render(<App />);
