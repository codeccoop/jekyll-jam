import { CodeNode } from "@lexical/code";

class BlockTokenNode extends CodeNode {
  static getType() {
    return "block-token";
  }

  static clone(node) {
    return new BlockTokenNode(node.defn, node.position);
  }

  static importJSON(serializedNode) {
    return $createBlockTokenNode(serializedNode.defn, serializedNode.position);
  }

  constructor(defn, position, key) {
    super("html", key);
    this.__blockName = defn.name;
    this.__args = defn.args;
    this.__position = position;
    this.__props = Object.fromEntries(defn.args.map((arg) => [arg, null]));
  }

  get token() {
    switch (this.position) {
      case 0:
        return `<${this.blockName}${this.tokenArgs}>`;
      case 1:
        return `</${this.blockName}>`;
      case 2:
        return `<${this.blockName}${this.tokenArgs}></${this.blockName}>`;
    }
  }

  get defn() {
    return {
      name: this.name,
      args: this.args,
    };
  }

  get blockName() {
    return this.__blockName;
  }

  get args() {
    return JSON.parse(JSON.stringify(this.__args));
  }

  get tokenArgs() {
    if (this.args.length) {
      return " " + this.args.map((arg) => `${arg}=""`).join(" ");
    }
    return "";
  }

  get props() {
    return this.__props;
  }

  set props(props) {
    const writable = this.getWritable();
    writable.__props = { ...this.props, ...props };
  }

  get position() {
    return this.__position;
  }

  createDOM(config, editor) {
    const el = super.createDOM(config);
    el.classList.add("vocero-block-token");
    el.innerText = this.token;
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
      type: "block-token",
      defn: this.defn,
      position: this.position,
    };
  }

  canIndent() {
    return false;
  }

  canInsertTab() {
    return false;
  }

  getLanguage() {
    return "html";
  }

  canBeEmpty() {
    return false;
  }

  canInsertAfter(node) {
    return false;
  }

  canInsertTextAfter() {
    return false;
  }

  canInsertTextBefore() {
    return false;
  }

  canReplaceWith() {
    return false;
  }

  collapseAtStart() {
    return true;
  }
}

export default BlockTokenNode;

export function $createBlockTokenNode(defn, position) {
  return new BlockTokenNode(defn, position);
}

export function $isBlockTokenNode(node) {
  return BlockTokenNode.prototype.isPrototypeOf(node);
}
