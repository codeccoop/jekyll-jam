/* VENDOR */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* SOURCE */
import { getProject } from "../../services/api.js";

const Component = ({ Warehouse, children }) => {
  const [state, setState] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    getProject().then(setState);
  }, []);

  useEffect(() => {
    if (state.GH_INIT !== void 0 && !state.GH_INIT) {
      navigate("/settings");
    }
  }, [state]);

  return (
    <Warehouse value={[state, () => {}]}>{state !== null ? children : void 0}</Warehouse>
  );
};

export default { name: "project", Component };
