const reducer = ({ state, action, payload }) => {
  switch (action) {
    case "ADD_CHANGE":
      const index = state.findIndex((d) => d.sha === payload.sha);
      if (index !== -1) {
        state = state.slice(0, index).concat(state.slice(index + 1, state.length));
      }

      return state.concat(payload);

    case "CLEAR_CHANGES":
      return [];
  }
};

export default reducer;
