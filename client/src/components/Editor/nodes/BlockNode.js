/* VENDOR */
import { ElementNode } from "lexical";

class BlockNode extends ElementNode {
  static getType() {
    return "block";
  }

  static clone(node) {
    return new BlockNode({ defn: node.defn, marked: node.marked });
  }

  static importJSON(serializedNode) {
    return $createBlockNode(serializedNode);
  }

  static toText(defn) {
    const args = defn.args.length ? " " + defn.args.map((a) => a + '=""').join(" ") : "";
    return `<${defn.name}${args}>\n</${defn.name}>`;
  }

  constructor({ defn, marked }, key) {
    super(key);
    this.__defn = defn;
    this.__marked = marked;
  }

  get defn() {
    return JSON.parse(JSON.stringify(this.__defn));
  }

  get marked() {
    return this.__marked;
  }

  createDOM(config, editor) {
    const el = document.createElement("div");
    el.classList.add("vocero-block");
    return el;
  }

  updateDOM(prevNode, dom, config) {
    if (prevNode.getTextContentSize() === 0) {
      this.remove();
    }
    return false;
  }

  exportDOM(editor) {
    const template = document.createElement("template");
    template.innerHTML = this.marked.parse(BlockNode.toText(this.defn));
    return {
      element: template.content,
    };
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      version: 1,
      type: "block",
      defn: this.defn,
      marked: this.marked,
    };
  }

  canBeEmpty() {
    return false;
  }
}

export default BlockNode;

export function $createBlockNode(defn, marked) {
  return new BlockNode({ defn, marked });
}

export function $isBlockNode(node) {
  return BlockNode.prototype.isPrototypeOf(node);
}
