/* VENDOR */
import React, { useEffect, useState } from "react";

/* SOURCE */
import { getBlocks } from "../../services/api.js";

const geval = eval;
const Component = ({ Warehouse, children }) => {
  const [state, setState] = useState([]);

  useEffect(() => {
    getBlocks()
      .then((res) => res.text())
      .then((script) => {
        const blocks = geval(script);
        setState(blocks);
      });
  }, []);

  return <Warehouse value={[state, () => {}]}>{children}</Warehouse>;
};

export default { name: "blocks", Component };
