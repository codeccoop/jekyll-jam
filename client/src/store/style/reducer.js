function reducer({ action, payload }) {
  if (action === "STORE_CSS") {
    return fetch(atob(payload.url), {
      headers: {
        "Accept": "text/css",
      },
    }).then((res) => res.text());
  }
}

export default reducer;
