/* VENDOR */
import React, { useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";

/* SOURCE */
import editorConfig from "./config";
import BlockNode from "components/Editor/nodes/BlockNode";

function LexicalContext({ children }) {
  // useEffect(() => {
  //   editorConfig.nodes.push(BlockNode);
  // }, []);
  editorConfig.nodes = editorConfig.nodes.concat([BlockNode]);

  return <LexicalComposer initialConfig={editorConfig}>{children}</LexicalComposer>;
}

export default LexicalContext;
