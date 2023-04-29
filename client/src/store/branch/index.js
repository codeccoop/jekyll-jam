/* VENDOR */
import React, { useEffect, useState } from "react";

/* SOURCE */
import reducer from "./reducer";
import { getBranch } from "services/api.js";

const Component = ({ Warehouse, children }) => {
  const [state, setState] = useState();

  useEffect(() => {
    loadBranch(getBranch());
  }, []);

  function loadBranch(promise) {
    promise.then(setState).catch((err) => {
      console.warn("Can't fetch branch");
      setState({});
    });
  }

  return <Warehouse value={[state, loadBranch]}>{children}</Warehouse>;
};

export default { name: "branch", Component, reducer };
