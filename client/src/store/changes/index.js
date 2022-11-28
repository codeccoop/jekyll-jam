/* VENDOR */
import React, { useEffect, useState } from "react";

/* SOURCE */
import reducer from "./reducer";

const Component = ({ Warehouse, children }) => {
  const [changes, setChanges] = useState();

  useEffect(() => {
    const changes = localStorage.getItem("_VOCERO_CHANGES") || "[]";
    setChanges(JSON.parse(changes));
  }, []);

  function setState(changes) {
    localStorage.setItem("_VOCERO_CHANGES", JSON.stringify(changes));
    setChanges(changes);
  }

  return <Warehouse value={[changes, setState]}>{children}</Warehouse>;
};

export default { name: "changes", Component, reducer };
