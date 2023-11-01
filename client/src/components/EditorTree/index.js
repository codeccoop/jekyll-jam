import React, { useState, useEffect } from "react";
import { $getNodeByKey, $getRoot } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { getTree } from "lib/tree";

function TreeNode({ node, onSelect }) {
  const onClick = (ev) => {
    ev.stopPropagation();
    onSelect(node);
  };

  if (node.type === "text") return null;
  return (
    <div className="node" onClick={onClick}>
      <p>{node.type}</p>
      <ul>
        {node.children.map((node) => (
          <TreeNode key={node.key} node={node} onSelect={onSelect} />
        ))}
      </ul>
    </div>
  );
}

function EditorTree() {
  const [editor] = useLexicalComposerContext();
  const [tree, setTree] = useState([]);
  const [node, setNode] = useState(null);

  const buildTree = ({ editorState }) => {
    editorState.read(() => {
      const root = $getRoot();
      Promise.all(
        root.getChildren().map((child) => getTree(child, editor))
      ).then(setTree);
    });
  };

  useEffect(() => {
    buildTree({ editorState: editor.getEditorState() });
  }, []);

  useEffect(() => {
    editor.registerUpdateListener(buildTree);
  }, [editor]);

  useEffect(() => console.log(tree), [tree]);

  useEffect(() => {
    if (!node) return;
    node.editor.focus();
  }, [node]);

  return (
    <ul>
      {tree.map((node) => (
        <TreeNode
          key={node.key}
          onSelect={(node) => setNode(node)}
          node={node}
        />
      ))}
    </ul>
  );
}

export default EditorTree;
