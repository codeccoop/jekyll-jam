/* VENDOR */
import React from "react";
import { $getNodeByKey, createEditor, DecoratorNode } from "lexical";

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

  constructor({ defn, ID, ancestors = [], editor }, key) {
    super(key);
    this.__defn = defn;
    this.__ID = ID;
    this.__ancestors = ancestors;
    this.__editor = editor || createEditor();
  }

  get defn() {
    return JSON.parse(JSON.stringify(this.__defn));
  }

  get ID() {
    return this.__ID;
  }

  get ancestors() {
    return JSON.parse(JSON.stringify(this.__ancestors));
  }

  get editor() {
    return this.__editor;
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
    const t = document.createElement("template");
    t.classList.add("vocero-block");
    t.id = this.ID;
    return { element: t };
    // const template = document.createElement("template");
    // template.innerHTML = this.marked.parse(BlockNode.toText(this.defn));
    // return {
    //   element: template.content,
    // };
  }

  getTextContent() {
    return `<VoceroBlock id="${this.ID}" />`;
    // const args = this.defn.args.length
    //   ? " " + this.defn.args.map((a) => a + '=""').join(" ")
    //   : "";
    // return `<${this.defn.name}${args}>\n</${this.defn.name}>`;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      version: 1,
      type: "block",
      defn: this.defn,
      editor: this.editor,
      ID: this.ID,
      ancestors: this.ancestors,
    };
  }

  decorate(editor, config) {
    return (
      <BlockComponent
        blockID={this.ID}
        defn={this.defn}
        editor={this.editor}
        ancestors={this.ancestors}
      />
    );
  }

  isIsolated() {
    return true;
  }

  focus() {
    this.editor.focus();
  }
}

export default BlockNode;

export function $createBlockNode({ defn, ID, ancestors }) {
  return new BlockNode({ defn, ID, ancestors });
}

export function $isBlockNode(node) {
  return BlockNode.prototype.isPrototypeOf(node);
}
