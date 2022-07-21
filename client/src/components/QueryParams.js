import React, { useEffect, useState } from "react";
import QueryParamsContext from "../store/QueryParams.js";
import { parseQueryParams, stringifyQueryParams } from "../utils/url.js";

export default function QueryParams({ children }) {
  const [queryParams, setQueryParams] = useState(parseQueryParams());

  useEffect(() => {
    history.pushState(
      queryParams,
      null,
      `${location.pathname}?${stringifyQueryParams(queryParams)}`
    );
  }, [queryParams]);

  return (
    <QueryParamsContext.Provider
      value={[queryParams, changes => setQueryParams({ ...queryParams, ...changes })]}
    >
      {children}
    </QueryParamsContext.Provider>
  );
}
