/* VENDOR */
import { $getNodeByKey } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";

/* SOURCE */
import BlockNode, {
  $createBlockNode,
  $isBlockNode,
} from "components/Editor/nodes/BlockNode";
import { uuid } from "lib/helpers";

function htmlToDom(html) {
  const parser = document.createElement("template");
  parser.innerHTML = html;
  return parser.content;
}

function domToHtml(dom) {
  return Array.from(dom.children).reduce((html, child) => {
    return html + child.outerHTML;
  }, "");
}

function pruneDom(dom, selectors) {
  return selectors.reduce((dom, selector) => {
    const target = dom.querySelector(selector);
    if (!target) return dom;
    const root = target.parentElement;
    Array.from(target.children).forEach((child) => {
      root.appendChild(child);
    });
    root.removeChild(target);
    return pruneDom(dom, [selector]);
  }, dom);
}

function blockMeta(id, block) {
  const meta = {
    id: id,
    props: block.props,
    defn: block.defn,
    editor: block.editor.getEditorState().toJSON(),
  };
  return `<!-- VoceroBlock meta="${btoa(JSON.stringify(meta))}" -->`;
}

function nestedBlocksReplacer(html, blocks = []) {
  const dom = htmlToDom(html);
  if (dom.children.length === 0) return blocks;

  let isBlock = false;
  Array.from(dom.children[0].childNodes).reduce((blocks, node) => {
    if (isBlock) {
      nestedBlocksReplacer(node.innerHTML, blocks[blocks.length - 1].children);
      isBlock = false;
      return blocks;
    }

    if (Comment.prototype.isPrototypeOf(node)) {
      const match = node.textContent.match(/VoceroBlock meta="([^"]+)"/);
      if (match) {
        const meta = JSON.parse(atob(match[1]));
        meta.children = [];
        blocks.push(meta);
        isBlock = true;
      }
      return blocks;
    }
  }, blocks);

  return blocks;
}

function blockReplacer(parentNode, children, match) {
  // const nested = nestedBlocksReplacer(match[0]);
  const meta = JSON.parse(atob(match[1]));
  this.storeBlock(meta);
  const node = $createBlockNode({
    defn: meta.defn,
    id: meta.id,
    editorState: meta.editor,
    initState: meta.props,
  });
  parentNode.replace(node);
  // node.select(0, 0);
}

export function genBlockSerializer(storeBlock) {
  return {
    regExp: /^<!-- VoceroBlock meta="([^"]+)".*/,
    replace: blockReplacer.bind({ storeBlock }),
    type: "element",
  };
}

function nestedBlocksExporter(dom) {
  Array.from(dom.querySelectorAll(".vocero-block-wrapper")).forEach((wrapper) => {
    const blockID = wrapper.id;
    const block = this.blocks[blockID];
    wrapper.insertAdjacentHTML("beforeBegin", blockMeta(blockID, block));
    Array.from(wrapper.children).forEach((child) => {
      wrapper.parentElement.insertBefore(child, wrapper);
    });
    wrapper.parentElement.removeChild(wrapper);
  });
  return dom;
}

function blockExporter(node, exportChildren) {
  if (!$isBlockNode(node)) return null;
  const block = this.blocks[node.ID];
  if (block.dom) {
    const dom = pruneDom(htmlToDom(block.dom.innerHTML), [
      ".vocero-block-wrapper",
      ".vocero-block",
      ".block-editor-input",
    ]);
    // const dom = nestedBlocksExporter.bind(this)(
    //   pruneDom(htmlToDom(block.dom.innerHTML), [".vocero-block", ".block-editor-input"])
    // );
    return blockMeta(node.ID, block) + domToHtml(dom);
  }
  return "";
}

export function genBlockTransformer(blocks) {
  return {
    dependencies: [BlockNode],
    export: blockExporter.bind({ blocks }),
    type: "element",
  };
}

function renderDecorators(editor) {
  return new Promise((res, rej) => {
    const state = editor.getEditorState().clone(null);
    state.read(() => {
      const html = $generateHtmlFromNodes(editor);
      const dom = htmlToDom(html);
      const decorators = editor.getDecorators();
      if (Object.keys(decorators).length === 0) res(dom);
      else {
        Promise.all(
          Object.keys(decorators).map((key) => {
            const node = $getNodeByKey(key);
            return renderDecorators(node.editor).then((dom) => [node, dom]);
          })
        )
          .then((renders) => {
            renders.forEach(([node, nodeDOM]) => {
              dom.getElementById(node.ID).replaceWith(nodeDOM);
            });
            res(dom);
          })
          .catch((err) => {
            rej(err);
          });
      }
    });
  });
}
