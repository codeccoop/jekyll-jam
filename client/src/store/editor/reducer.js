const reducer = ({ state, action, payload }) => {
  switch (action) {
    case "ADD_BLOCK":
      const block = {
        ID: payload.ID,
        dom: payload.dom,
        defn: payload.defn,
        props: payload.props,
        editor: payload.editor,
      };
      return { ...state, blocks: { ...state.blocks, [payload.ID]: block } };

    case "DROP_BLOCK":
      return {
        ...state,
        blocks: Object.fromEntries(
          Object.entries(state.blocks).filter(([ID]) => ID !== payload.ID)
        ),
      };

    case "SET_CONTENT":
      return { ...state, content: payload.content };

    case "STORE_STATE":
      state.state.clone();
  }
};

export default reducer;
