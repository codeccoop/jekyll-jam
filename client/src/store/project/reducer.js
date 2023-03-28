function reducer({ action, payload }) {
  switch (action) {
    case "PATCH_PROJECT":
      return Object.fromEntries(
        Object.entries(payload).map((e) => {
          return [e[0], e[1].trim()];
        })
      );
  }
}

export default reducer;
