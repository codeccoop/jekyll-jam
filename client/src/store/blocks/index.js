/* VENDOR */
import React, { useEffect, useState } from "react";

/* SOURCE */
import { getBlocks } from "services/api.js";
import { RootNode } from "nodes/jsonNodes";

const rootBlock = {
  ...RootNode().defn,
  fn: ({ React, children }) =>
    React.createElement("div", { className: "vocero-root" }, children),
};

const geval = window.eval;
const Component = ({ Warehouse, children }) => {
  const [state, setState] = useState([]);

  useEffect(() => {
    getBlocks()
      .then((res) => res.text())
      .then((script) => {
        const blocks = geval(script);
        setState([rootBlock].concat(blocks));
      });
  }, []);

  return <Warehouse value={[state, () => {}]}>{children}</Warehouse>;
};

export default { name: "blocks", Component };
