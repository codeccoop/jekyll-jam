/* VENDOR */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* SOURCE */
import { getProject } from "../../services/api.js";
import reducer from "./reducer";

const Component = ({ Warehouse, children }) => {
  const [state, setState] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getProject()
      .then(setState)
      .catch((err) => {
        console.log(err);
        console.error("Can't fetch project");
      });
  }, []);

  useEffect(() => {
    if (!state) return;
    if (!state.GH_INIT) {
      navigate("/init");
    }
  }, [state]);

  function updateProject(project) {
    Promise.resolve(project).then((project) => {
      setState({ ...state, ...project });
    });
  }

  return (
    <Warehouse value={[state, updateProject]}>
      {state !== null ? children : void 0}
    </Warehouse>
  );
};

export default { name: "project", Component, reducer };
