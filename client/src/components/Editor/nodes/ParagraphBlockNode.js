/* VENDOR */
import { ParagraphNode } from "lexical";

class ParagraphBlockNode extends ParagraphNode {
  static getType() {
    return "block-paragraph";
  }

  constructor(key) {
    super(key);
  }

  static clone() {
    return new ParagraphBlockNode();
  }

  static importJSON(serializedNode) {
    return $createParagraphBlockNode(serializedNode);
  }

  createDOM(config) {
    const el = super.createDOM(config);
    el.classList.add("vocero-block-paragraph");
    return el;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      version: 1,
      type: "paragraph-block",
    };
  }
}

export default ParagraphBlockNode;

export function $createParagraphBlockNode() {
  return new ParagraphBlockNode();
}

export function $isBlockNode(node) {
  return ParagraphBlockNode.prototype.isPrototypeOf(node);
}
