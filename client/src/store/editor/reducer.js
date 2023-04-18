const reducer = ({ state, action, payload }) => {
  switch (action) {
    case "ADD_BLOCK":
      console.log(payload);
      const block = {
        id: payload.id,
        dom: payload.dom,
        defn: payload.defn,
        props: payload.props,
        editor: payload.editor,
      };
      return { ...state, blocks: { ...state.blocks, [payload.id]: block } };

    case "DROP_BLOCK":
      return {
        ...state,
        blocks: Object.fromEntries(
          Object.entries(state.blocks).filter(([id]) => {
            return id !== payload.id;
          })
        ),
      };

    case "SET_CONTENT":
      return { ...state, content: payload.content };

    case "STORE_STATE":
      state.state.clone();
  }
};

export default reducer;
