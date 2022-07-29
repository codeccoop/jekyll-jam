import React, { createContext, useContext, useEffect, useState } from "react";

import { getBranch } from "../services/api.js";

export const BranchContext = createContext([{}, () => {}]);

export function BranchStore({ children }) {
  const [state, setState] = useState({});

  useEffect(() => {
    getBranch().then(setState);
  }, []);

  return (
    <BranchContext.Provider value={[state, setState]}>{children}</BranchContext.Provider>
  );
}

export function useBranch() {
  return useContext(BranchContext);
}

export default BranchContext;
