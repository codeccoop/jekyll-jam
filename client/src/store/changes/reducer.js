function pop(state, { sha }) {
  const index = state.findIndex((d) => d.sha === sha);
  if (index !== -1) {
    return state.slice(0, index).concat(state.slice(index + 1, state.length));
  }

  return state;
}

const reducer = ({ state, action, payload }) => {
  switch (action) {
    case "ADD_CHANGE":
      return pop(state, payload).concat(payload);

    case "DROP_CHANGE":
      return pop(state, payload);

    case "CLEAR_CHANGES":
      return [];
  }
};

export default reducer;
