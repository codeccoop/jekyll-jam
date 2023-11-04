import React, { useState, useEffect } from "react";
import { $getNodeByKey, $getRoot } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { useEditorFocus } from "context/EditorFocus";
import { getTree } from "utils/tree";

import TreeState, { useTreeState } from "./TreeState";

import "./style.scss";

function TreeNode({ node }) {
  const [focusedNode, setFocusedNode] = useEditorFocus();
  const [visibilities] = useTreeState();

  const onClick = (ev) => {
    ev.stopPropagation();
    visibilities[node.key] = !visibilities[node.key];
    if (visibilities[node.key]) {
      node.editor._parentEditor.getEditorState().read(() => {
        const blockNode = $getNodeByKey(node.key);
        setFocusedNode(blockNode);
      });
    }
  };

  const getClassName = () => {
    const classes = ["node"];
    node.key === focusedNode?.getKey() && classes.push("selected");

    visibilities
      ? !visibilities[node.key] && classes.push("collapsed")
      : classes.push("collapsed");
    return classes.join(" ");
  };

  if (!node.isBlock) return null;
  return (
    <div className={getClassName()} onClick={onClick}>
      <p>{node.type}</p>
      <ul>
        {node.children.map((node) => (
          <TreeNode key={node.key} node={node} />
        ))}
      </ul>
    </div>
  );
}

function EditorTree() {
  const [editor] = useLexicalComposerContext();
  const [tree, setTree] = useState([]);

  const buildTree = ({ editorState }) => {
    editorState.read(() => {
      const root = $getRoot();
      Promise.all(
        root.getChildren().map((child) => getTree(child, editor))
      ).then((tree) => setTree(filterTree(tree)));
    });
  };

  const filterTree = (tree) => {
    return tree.reduce((acum, node) => {
      if (!node.isBlock) return acum.concat(filterTree(node.children));
      return acum.concat(node);
    }, []);
  };

  useEffect(() => {
    buildTree({ editorState: editor.getEditorState() });
  }, []);

  useEffect(() => {
    editor.registerUpdateListener(buildTree);
  }, [editor]);

  return (
    <TreeState tree={tree}>
      <ul className="editor-tree">
        {tree.map((node) => (
          <TreeNode key={node.key} node={node} />
        ))}
      </ul>
    </TreeState>
  );
}

export default EditorTree;
