/* VENDOR */
import React from "react";
import { createEditor, DecoratorNode } from "lexical";

/* SOURCE */
import BlockComponent from "./BlockComponent";
import { b64e } from "lib/helpers";

const EMPTY_STATE = () => ({
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
});

const PARAGRAPH_NODE = () => ({
  children: [],
  direction: "ltr",
  format: "",
  indent: 0,
  type: "paragraph",
  version: 1,
});

function initBlockEditor(editorState) {
  editorState = editorState || EMPTY_STATE();

  if (editorState.root.children.length === 0) {
    editorState.root.children.push(PARAGRAPH_NODE());
  }

  const editor = createEditor();
  editor.setEditorState(editor.parseEditorState(editorState));
  editor.setEditable(true);

  return editor;
}

class BlockNode extends DecoratorNode {
  static getType() {
    return "block";
  }

  static clone(node) {
    return new BlockNode(
      {
        defn: node.defn,
        ancestors: node.ancestors,
        editor: node.editor,
        props: node.props,
        focus: node.isFocus,
      },
      node.getKey()
    );
  }

  static importJSON(serializedNode) {
    return $createBlockNode(serializedNode);
  }

  constructor(
    { defn, editor, editorState, ancestors = [], props = {}, focus = 0 },
    key
  ) {
    super(key);
    this.__defn = defn;
    this.__ancestors = ancestors;
    this.__editor = editor || initBlockEditor(editorState);
    this.__props = props;
    this.__focus = focus;
  }

  get defn() {
    return this.__defn;
  }

  get ancestors() {
    return this.__ancestors;
  }

  get editor() {
    return this.__editor;
  }

  get props() {
    return this.__props;
  }

  set props(props) {
    const writable = this.getWritable();
    Object.keys(props).forEach((key) => (writable.__props[key] = props[key]));
  }

  get isFocus() {
    return this.__focus;
  }

  focus() {
    const writable = this.getWritable();
    writable.__focus += 1;
  }

  createDOM(_, editor) {
    const el = document.createElement("div");
    el.classList.add("vocero-block");
    el.id = this.getKey();
    return el;
  }

  updateDOM(/* _prevNode, _dom, _config */) {
    return false;
  }

  exportDOM(editor) {
    const el = document.createElement("div");
    el.classList.add("vocero-block");
    el.id = this.getKey();
    el.setAttribute(
      "data-editor",
      b64e(JSON.stringify(editor.getEditorState().toJSON()))
    );
    return { element: el };
  }

  exportJSON() {
    return {
      version: 1,
      type: "block",
      defn: this.defn,
      editorState: this.editor.getEditorState().toJSON(),
      ancestors: this.ancestors,
      props: this.props,
    };
  }

  decorate(editor /*, config */) {
    return (
      <BlockComponent
        nodeKey={this.getKey()}
        defn={this.defn}
        editor={this.editor}
        parentEditor={editor}
        ancestors={this.ancestors}
        initProps={this.props}
        focus={this.isFocus}
      />
    );
  }

  isIsolated() {
    return true;
  }
}

export function $createBlockNode({ defn, ancestors, props, editorState }) {
  return new BlockNode({ defn, ancestors, props, editorState });
}

export function $isBlockNode(node) {
  return BlockNode.prototype.isPrototypeOf(node);
}

export default BlockNode;
