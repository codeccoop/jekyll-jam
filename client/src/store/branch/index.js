/* VENDOR */
import React, { useEffect, useState } from "react";

/* SOURCE */
import reducer from "./reducer";
import { getBranch } from "../../services/api.js";

const Component = ({ Warehouse, children }) => {
  const [state, setState] = useState({});

  useEffect(() => {
    getBranch().then(setState);
  }, []);

  return <Warehouse value={[state, setState]}>{children}</Warehouse>;
};

export default { name: "branch", Component, reducer };
