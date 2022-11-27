function encodeQuery(query) {
  return Object.entries(query)
    .map((e) => e.map(encodeURIComponent).join("="))
    .join("&");
}

function genHref(query) {
  query = Object.fromEntries(Object.entries(query).filter(([k, v]) => v !== void 0));
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
  }
}

export default reducer;
