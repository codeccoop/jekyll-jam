/* VENDOR */
import React, { useState } from "react";
import reducer from "./reducer";

const Component = ({ Warehouse, children }) => {
  const [state, setState] = useState();

  return <Warehouse value={[state, setState]}>{children}</Warehouse>;
};

export default { name: "block", Component, reducer };
