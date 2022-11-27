/* VENDOR */
import React, { useEffect, useState } from "react";

/* SOURCE */
import reducer from "./reducer";
import { getBranch } from "../../services/api.js";

const Component = ({ warehouse, children }) => {
  const [state, setState] = useState({});

  useEffect(() => {
    getBranch().then(setState);
  }, []);

  return <warehouse.Provider value={[state, setState]}>{children}</warehouse.Provider>;
};

export default { name: "branch", Component, reducer };
