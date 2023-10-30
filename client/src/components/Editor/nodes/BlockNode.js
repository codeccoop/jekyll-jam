/* VENDOR */
import React from "react";
import { renderToString } from "react-dom/server.browser";
import { createEditor, DecoratorNode } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";

/* SOURCE */
import BlockComponent from "./BlockComponent";
import { b64e, b64d } from "lib/helpers";

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

function htmlToDom(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content;
}

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
    this.__editor = defn.selfClosed
      ? null
      : editor || initBlockEditor(editorState);
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
    if (this.defn.selfClosed) {
      el.addEventListener("click", () => {
        editor.update(() => {
          this.focus();
        });
      });
    }

    return el;
  }

  updateDOM(prevNode, dom, config) {
    return false;
  }

  static _importDOM(el) {
    if (!el.dataset.vblock) return null;

    const { _vBlocks: blocks } = el.getRootNode();
    let block,
      defn,
      props,
      editorState = null;

    try {
      block = JSON.parse(b64d(el.dataset.vblock));
      props = JSON.parse(b64d(el.dataset.props));
      defn = blocks.find((b) => b.name === block);
      if (el.dataset.editor) {
        editorState = JSON.parse(b64d(el.dataset.editor));
      }
    } catch (e) {
      return null;
    }

    return {
      priority: 10,
      conversion: (el) => {
        Array.from(el.children).forEach((child, i) => {
          const { conversion } = BlockNode._importDOM(child) || {};
          if (conversion) {
            const { node } = conversion(child);
            editorState.root.children[i] = node.exportJSON();
          }
        });
        el.innerHTML = "";
        const node = new BlockNode({
          defn,
          props,
          editorState,
        });

        return { node };
      },
    };
  }

  static importDOM() {
    return Object.fromEntries(
      ["div", "p", "video", "img", "span"].map((tag) => [
        tag,
        BlockNode._importDOM,
      ])
    );
  }

  exportDOM(editor) {
    let element;
    if (this.getType() === "block") {
      element = this.buildDOM({ blocks: editor._vBlocks });

      if (!this.defn.selfClosed) {
        this.editor._vBlocks = editor._vBlocks;
        this.editor.getEditorState().read(() => {
          const dom = htmlToDom($generateHtmlFromNodes(this.editor));
          Array.from(dom.children).forEach((child) => {
            element.appendChild(child);
          });
        });
      }
    }

    const setAttr = ((e, k, d) =>
      e.setAttribute(`data-${k}`, b64e(JSON.stringify(d)))).bind(null, element);

    setAttr("vblock", this.defn.name);
    setAttr("props", this.props);
    if (this.editor) {
      const editorState = this.editor.getEditorState().toJSON();
      editorState.root.children = editorState.root.children.map((child) => {
        if (child.type === "block") return null;
        return child;
      });
      setAttr("editor", editorState);
    }

    return { element };
  }

  buildDOM({ blocks }) {
    const Block =
      blocks.find((block) => block.name === this.defn.name)?.fn || (() => {});

    const html = renderToString(<Block {...this.props} React={React} />);
    const dom = htmlToDom(html);
    if (dom.children.length > 1) {
      throw new Error("Block Component should have one root element");
    }

    return dom.children[0];
  }

  exportJSON() {
    return {
      version: 1,
      type: "block",
      defn: this.defn,
      editorState: this.editor?.getEditorState().toJSON(),
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
        initProps={Object.assign({}, this.props)}
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
