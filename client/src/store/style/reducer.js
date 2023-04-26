function reducer({ action, payload }) {
  if (action === "STORE_CSS") {
    return payload;
    // return fetch(b64d(payload.path), {
    //   headers: {
    //     Accept: "text/css",
    //   },
    // }).then((res) => res.text());
  }
}

export default reducer;
