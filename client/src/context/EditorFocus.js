/* VENDOR */
import React, { createContext, useContext, useEffect, useState } from "react";

let _node;

const Context = createContext([_node, (node) => (_node = node)]);

export function useEditorFocus() {
  return useContext(Context);
}

function EditorFocus({ children }) {
  const [node, setNode] = useState(_node);
  useEffect(() => {
    if (node && node.editor) {
      node.editor.focus();
    }
    _node = node;
  }, [node]);

  const nodeSetter = (newNode) => {
    if (_node === newNode) return;
    setNode(newNode);
  };

  return (
    <Context.Provider value={[node, nodeSetter]}>{children}</Context.Provider>
  );
}

export default EditorFocus;
