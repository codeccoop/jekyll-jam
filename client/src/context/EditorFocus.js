/* VENDOR */
import { $getNodeByKey } from "lexical";
import React, { createContext, useContext, useEffect, useState } from "react";

/* SOURCE */
import { $isBlockNode } from "nodes/BlockNode";

let _node;

const Context = createContext([_node, (node) => (_node = node)]);

export function useEditorFocus() {
  return useContext(Context);
}

function EditorFocus({ children }) {
  const [node, setNode] = useState(_node);
  useEffect(() => {
    if (node && node.editor) {
      console.log("focus");
      node.editor.focus();
    }
    _node = node;
  }, [node]);

  const nodeSetter = (newNode) => {
    if (_node === newNode) return;
    setNode(newNode);
    // if (newNode === null) return setNode(newNode);

    // if (!$isBlockNode(newNode)) {
    //   newNode.editor._parentEditor.getEditorState().read(() => {
    //     setNode($getNodeByKey(newNode.key));
    //   });
    // } else {
    //   setNode(newNode);
    // }
  };

  return (
    <Context.Provider value={[node, nodeSetter]}>{children}</Context.Provider>
  );
}

export default EditorFocus;
