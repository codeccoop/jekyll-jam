import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import reducer from "./reducer";

const Component = ({ Warehouse, children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [state, setState] = useState(
    Object.fromEntries(new URLSearchParams(location.search).entries())
  );

  useEffect(() => {
    setState(Object.fromEntries(new URLSearchParams(location.search).entries()));
  }, [location]);

  function setQuery(query) {
    navigate({ ...location, search: new URLSearchParams(query).toString() });
  }

  return <Warehouse value={[state, setQuery]}>{children}</Warehouse>;
};

export default { name: "query", Component, reducer };
