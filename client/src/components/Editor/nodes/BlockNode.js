/* VENDOR */
import React from "react";
import { createEditor, DecoratorNode } from "lexical";

/* SOURCE */
// import ToolbarPlugin from "../plugins/ToolbarPlugin";
import editorConfig from "lib/contexts/Lexical/config";
import BlockComponent from "./BlockComponent";
import { b64e } from "lib/helpers";

const EMPTY_STATE = () => ({
  "root": {
    "children": [
      {
        "children": [],
        "direction": null,
        "format": "",
        "indent": 0,
        "type": "paragraph",
        "version": 1,
      },
    ],
    "direction": null,
    "format": "",
    "indent": 0,
    "type": "root",
    "version": 1,
  },
});

const PARAGRAPH_NODE = () => ({
  "children": [],
  "direction": "ltr",
  "format": "",
  "indent": 0,
  "type": "paragraph",
  "version": 1,
});

function initBlockEditor(state, config = {}) {
  const editor = createEditor({ ...editorConfig, ...config });
  LexicalEditorPrototype = editor.__proto__;

  if (!state) {
    state = EMPTY_STATE();
  }

  if (state.root.children.length === 0) {
    state.root.children.push(PARAGRAPH_NODE());
  }

  state = editor.parseEditorState(state);
  editor.setEditorState(state);
  editor.setEditable(true);

  return editor;
}

let LexicalEditorPrototype = {
  isPrototypeOf: () => false,
};

class BlockNode extends DecoratorNode {
  static getType() {
    return "block";
  }

  static clone(node) {
    return new BlockNode(
      {
        defn: node.defn,
        ID: node.ID,
        ancestors: node.ancestors,
        editor: node.editor,
        props: node.props,
      },
      node.getKey()
    );
  }

  static importJSON(serializedNode) {
    return $createBlockNode(serializedNode);
  }

  constructor({ ID, defn, editor, ancestors = [], props = {} }, key) {
    super(key);
    this.__ID = ID;
    this.__defn = defn;
    this.__ancestors = ancestors;
    this.__editor = LexicalEditorPrototype.isPrototypeOf(editor)
      ? editor
      : initBlockEditor(editor, { namespace: ID });
    this.__props = props;
  }

  get keyHandler() {
    return this.__keyHandler;
  }

  get defn() {
    return this.__defn;
  }

  get ID() {
    return this.__ID;
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

  createDOM(config, editor) {
    const el = document.createElement("div");
    el.classList.add("vocero-block");
    el.id = this.ID;
    return el;
  }

  updateDOM(_prevNode, _dom, _config) {
    return false;
  }

  exportDOM(editor) {
    const el = document.createElement("div");
    el.classList.add("vocero-block");
    el.id = this.ID;
    el.setAttribute(
      "data-editor",
      b64e(JSON.stringify(editor.getEditorState().toJSON()))
    );
    return { element: el };
  }

  exportJSON() {
    debugger;
    return {
      version: 1,
      type: "block",
      defn: this.defn,
      editor: this.editor.getEditorState().toJSON(),
      ID: this.ID,
      ancestors: this.ancestors,
      props: this.props,
    };
  }

  decorate(editor, config) {
    return (
      <BlockComponent
        nodeKey={this.getKey()}
        blockID={this.ID}
        defn={this.defn}
        editor={this.editor}
        ancestors={this.ancestors}
        initProps={this.props}
      />
    );
  }

  isIsolated() {
    return true;
  }
}

export function $createBlockNode({ defn, ID, ancestors, props, editor }) {
  return new BlockNode({ defn, ID, ancestors, props, editor });
}

export function $isBlockNode(node) {
  return BlockNode.prototype.isPrototypeOf(node);
}

export default BlockNode;
