/* VENDOR */
import React from "react";
import { createEditor, DecoratorNode } from "lexical";

/* SOURCE */
import BlockComponent from "./BlockComponent";

class BlockNode extends DecoratorNode {
  static getType() {
    return "block";
  }

  static clone(node) {
    return new BlockNode({
      defn: node.defn,
      ID: node.ID,
      ancestors: node.ancestors,
      editor: node.editor,
    });
  }

  static importJSON(serializedNode) {
    return $createBlockNode(serializedNode);
  }

  constructor({ defn, ID, ancestors = [], props = {}, editorState = {} }, key) {
    super(key);
    this.__defn = defn;
    this.__ID = ID;
    this.__ancestors = ancestors;
    this.__editor = createEditor();
    this.__editorState = editorState;
    this.__props = props;
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
    Object.keys(props).forEach((key) => (this.__props[key] = props[key]));
  }

  get editorState() {
    return this.__editorState;
  }

  createDOM(config, editor) {
    const el = document.createElement("div");
    el.classList.add("vocero-block");
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
      btoa(JSON.stringify(editor.getEditorState().toJSON()))
    );
    return { element: el };
  }

  exportJSON() {
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
        blockID={this.ID}
        defn={this.defn}
        editor={this.editor}
        ancestors={this.ancestors}
        initProps={JSON.parse(JSON.stringify(this.props))}
        shareProps={(props) => (this.props = props)}
        editorState={this.editorState}
      />
    );
  }

  isIsolated() {
    return true;
  }
}

export default BlockNode;

export function $createBlockNode({ defn, ID, ancestors, initState, editorState }) {
  return new BlockNode({ defn, ID, ancestors, editorState, initState });
}

export function $isBlockNode(node) {
  return BlockNode.prototype.isPrototypeOf(node);
}
