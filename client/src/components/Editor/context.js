import React, { createContext, useContext, useState } from "react";

const Context = createContext(null);

function EditorContext({ children }) {
  const [state, setState] = useState({});
  function addBlockContent(id, content) {
    setState({ ...state, [id]: content });
  }
  return <Context.Provider value={[state, addBlockContent]}>{children}</Context.Provider>;
}

export default EditorContext;

export function useEditorContext() {
  return useContext(Context);
}
