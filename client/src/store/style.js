import React, { createContext, useContext, useEffect, useState } from 'react';

import { getStyleURL } from '../services/api.js';
import { useBranch } from './branch.js';

export const StyleContext = createContext(null);

export function StyleStore({ children }) {
  const [state, setState] = useState();
  const branch = useBranch()[0];

  useEffect(() => {
    if (!branch?.sha) return;
    getStyleURL(branch.sha).then(data => {
      fetch(atob(data.url), {
        headers: {
          'Accept': 'text/css',
        },
      })
        .then(res => res.text())
        .then(data => {
          setState(data);
        });
    });
  }, [branch]);

  return <StyleContext.Provider value={state}>{children}</StyleContext.Provider>;
}

export function useStyle() {
  return useContext(StyleContext);
}

export default StyleContext;
