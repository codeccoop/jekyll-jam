/* VENDOR */
import React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";

/* SOURCE */
import editorConfig from "./config";
import BlockNode from "components/Editor/nodes/BlockNode";

function LexicalContext({ children }) {
  editorConfig.nodes = editorConfig.nodes.concat([BlockNode]);
  editorConfig.blocks = [];

  return (
    <LexicalComposer initialConfig={editorConfig}>{children}</LexicalComposer>
  );
}

export default LexicalContext;
