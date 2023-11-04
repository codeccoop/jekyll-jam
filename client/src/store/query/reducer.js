/* SOURCE */
import { encodeQuery } from "utils/url";

function genHref(query) {
  query = Object.fromEntries(
    Object.entries(query).filter(([k, v]) => v !== void 0)
  );
  if (Object.e(query).length === 0) {
    return location.pathname;
  }

  return `${location.pathname}?${encodeQuery(query)}`;
}

function reducer({ state, action, payload }) {
  let query;
  switch (action) {
    case "SET_QUERY":
      query = payload;
      return genHref(query);
    case "PATCH_QUERY":
      query = { ...state, ...payload };
      return genHref(search);
    case "REFRESH_SHA":
      return { ...state, sha: payload };
  }
}

export default reducer;
