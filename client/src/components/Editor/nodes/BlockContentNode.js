import { ParagraphNode } from "lexical";

class BlockContentNode extends ParagraphNode {
  static getType() {
    return "block-content";
  }

  static clone(node) {
    return new BlockContentNode();
  }

  static importJSON(serializedNode) {
    return $createBlockContentNode(serializedNode);
  }

  constructor(key) {
    super(key);
  }

  createDOM(config, editor) {
    // const el = document.createElement("div");
    const el = super.createDOM(config);
    el.classList.add("vocero-block-content");
    return el;
  }

  updateDOM(prevNode, dom, config) {
    return false;
  }

  exportDOM(editor) {
    return this.getTextContent();
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      version: 1,
      type: "block-content",
    };
  }

  // isShadowRoot() {
  //   return true;
  // }
}

export default BlockContentNode;

export function $createBlockContentNode() {
  return new BlockContentNode();
}

export function $isBlockContentNode(node) {
  return BlockContentNode.prototype.isPrototypeOf(node);
}
