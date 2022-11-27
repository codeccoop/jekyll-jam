function reducer({ action, payload }) {
  if (action === "SET_BRANCH") return payload;
}

export default reducer;
