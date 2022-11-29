/* VENDOR */
import React, { useState } from "react";

/* SOURCE */
import reducer from "./reducer";

const Component = ({ Warehouse, children }) => {
  const memory = localStorage.getItem("_VOCERO_CHANGES") || "[]";
  const [changes, setChanges] = useState(JSON.parse(memory));

  function setState(changes) {
    localStorage.setItem("_VOCERO_CHANGES", JSON.stringify(changes));
    setChanges(changes);
  }

  return (
    <Warehouse value={[changes, setState]}>
      {changes !== void 0 ? children : void 0}
    </Warehouse>
  );
};

export default { name: "changes", Component, reducer };
