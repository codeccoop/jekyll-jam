import React, { createContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const QueryParamsContext = createContext([{}, () => {}]);

export function QueryParams({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [state, _setState] = useState(
    Object.fromEntries(new URLSearchParams(location.search).entries())
  );

  useEffect(() => {
    _setState(Object.fromEntries(new URLSearchParams(location.search).entries()));
  }, [location]);

  function setState(search) {
    const href =
      location.pathname +
      "?" +
      Object.entries(search)
        .map(e => e.map(encodeURIComponent).join("="))
        .join("&");

    navigate(href);
  }

  return (
    <QueryParamsContext.Provider value={[state, setState]}>
      {children}
    </QueryParamsContext.Provider>
  );
}

export default QueryParamsContext;
