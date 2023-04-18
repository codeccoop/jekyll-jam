/* VENDOR */
import React, { useEffect, useState } from "react";

/* SOURCE */
import reducer from "./reducer";

const Component = ({ Warehouse, children }) => {
  const [state, setState] = useState({
    content: "",
    blocks: {},
  });

  return <Warehouse value={[state, setState]}>{children}</Warehouse>;
};

export default { name: "editor", Component, reducer };
