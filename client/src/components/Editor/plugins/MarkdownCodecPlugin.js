import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { TRANSFORMERS, $convertToMarkdownString } from "@lexical/markdown";
import { $getNodeByKey } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";
import { useEditorContext } from "../context";
import BlockNode, { $createBlockNode, $isBlockNode } from "../nodes/BlockNode";
import { useEffect } from "react";

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

function pruneDom(dom, selector) {
  const editor = dom.querySelector(selector);
  if (!editor) return dom;
  const root = editor.parentElement;
  for (const child of editor.children) {
    root.appendChild(child);
  }
  root.removeChild(editor);
  return pruneDom(dom, selector);
}

function genBlockTransform(blocks) {
  return {
    dependencies: [BlockNode],
    export: (node, exportChildren) => {
      if (!$isBlockNode(node)) return null;
      const content = blocks[node.ID];
      if (content) {
        const dom = pruneDom(
          pruneDom(htmlToDom(content.current.outerHTML), ".block-editor-input"),
          ".vocero-block"
        );
        return domToHtml(dom);
      }
      return "";
    },
    regExp: /^<VoceroBlock id="([^"]+)"/,
    replace: (parentNode, children, match) => {
      debugger;
      const node = $createBlockNode({});
      node.append(...children);
      parentNode.replace(node);
      node.select(0, 0);
    },
    type: "element",
  };
}

function MarkdownCodecPlugin({ onPreview, setContent }) {
  const [editor] = useLexicalComposerContext();
  const [blocks] = useEditorContext();
  const transformers = [...TRANSFORMERS, genBlockTransform(blocks)];

  useEffect(() => {
    console.log(onPreview);
    if (!onPreview) return;
    editor.getEditorState().read(() => {
      setContent($convertToMarkdownString(transformers));
    });
  }, [onPreview]);
  // editor.registerUpdateListener(({ editorState }) => {
  //   // renderDecorators(editor)
  //   //   .then((dom) => {
  //   //     // console.log(domToHtml(dom));
  //   //   })
  //   //   .catch((err) => console.debug(err));
  //   const state = editorState.clone(null);
  //   state.read(() => {
  //     // console.log($convertToMarkdownString(transformers));
  //     // console.log($generateHtmlFromNodes(editor));
  //     // console.log(blocks);
  //     // onUpdate($convertToMarkdownString(transformers));
  //   });
  // });
}

export default MarkdownCodecPlugin;
