/* VENDOR */
// import { $getNodeByKey } from "lexical";
// import { $generateHtmlFromNodes } from "@lexical/html";

/* SOURCE */
import BlockNode, {
  $createBlockNode,
  $isBlockNode,
} from "components/Editor/nodes/BlockNode";
import { b64d, b64e } from "lib/helpers";

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

function blockMeta(block) {
  const meta = {
    props: block.props,
    defn: block.defn,
    editorState: block.editor.getEditorState().toJSON(),
  };
  return `<!-- VoceroBlock meta="${b64e(JSON.stringify(meta))}" -->`;
}

function blockReplacer(parentNode, _, match) {
  const meta = JSON.parse(b64d(match[1]));
  const node = $createBlockNode({
    defn: meta.defn,
    editorState: meta.editorState,
    props: meta.props,
  });
  parentNode.replace(node);
  // console.log(node.editor.getRootElement().click());
  // node.select(0, 0);
}

export function genBlockSerializer(storeBlock) {
  return {
    regExp: /^<!-- VoceroBlock meta="([^"]+)".*/,
    replace: blockReplacer,
    type: "element",
  };
}

function blockExporter(node) {
  if (!$isBlockNode(node)) return null;
  const block = this.blocks[node.getKey()];
  if (block.dom) {
    const dom = pruneDom(htmlToDom(block.dom.innerHTML), [
      ".vocero-block-wrapper",
      ".vocero-block",
      ".block-editor-input",
    ]);
    return blockMeta(block) + domToHtml(dom);
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

// function renderDecorators(editor) {
//   return new Promise((res, rej) => {
//     const state = editor.getEditorState().clone(null);
//     state.read(() => {
//       const html = $generateHtmlFromNodes(editor);
//       const dom = htmlToDom(html);
//       const decorators = editor.getDecorators();
//       if (Object.keys(decorators).length === 0) res(dom);
//       else {
//         Promise.all(
//           Object.keys(decorators).map((key) => {
//             const node = $getNodeByKey(key);
//             return renderDecorators(node.editor).then((dom) => [node, dom]);
//           })
//         )
//           .then((renders) => {
//             renders.forEach(([node, nodeDOM]) => {
//               dom.getElementById(node.ID).replaceWith(nodeDOM);
//             });
//             res(dom);
//           })
//           .catch((err) => {
//             rej(err);
//           });
//       }
//     });
//   });
// }
