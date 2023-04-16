/* VENDOR */
import React from "react";
// import { $createTextNode, $getRoot, $getSelection } from "lexical";
// import { $insertNodeToNearestRoot } from "@lexical/utils/";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useStore } from "colmado";

/* SOURCE */
import { INSERT_BLOCK_NODE } from "../Editor/plugins/BlockNodesPlugin";
// import BlockNode, { $createBlockNode } from "../Editor/nodes/BlockNode";
// import ParagraphBlockNode, {
//   $createParagraphBlockNode,
// } from "../Editor/nodes/ParagraphBlockNode";
// import useMarked from "../../hooks/useMarked";

/* STYLE */
import "./style.scss";

function BlocksList({ blocks = [], onSelect }) {
  return (
    <ul>
      {blocks.map((block, i) => (
        <li key={block.name + "-" + i} onClick={() => onSelect(block)}>
          {block.name}
        </li>
      ))}
    </ul>
  );
}

export default function Blocks() {
  const [{ blocks }] = useStore();
  const [editor] = useLexicalComposerContext();
  // const marked = useMarked();

  // function createBlockNode(block) {
  //   editor.dispatchCommand(INSERT_BLOCK_NODE, block);
  //   const blockNode = $createBlockNode(block, marked);
  //   BlockNode.toText(block)
  //     .split("\n")
  //     .forEach((chunk, i, chunks) => {
  //       const paragraph = $createParagraphBlockNode();
  //       const textNode = $createTextNode(chunk);
  //       paragraph.append(textNode);
  //       blockNode.append(paragraph);
  //       if (i < chunks.length - 1) {
  //         const paragraph = $createParagraphBlockNode();
  //         blockNode.append(paragraph);
  //       }
  //     });
  //   return blockNode;
  // }

  function onSelectBlock(block) {
    editor.dispatchCommand(INSERT_BLOCK_NODE, { defn: block });
    // editor.update(() => {
    //   const selection = $getSelection();
    //   const nodes = selection.extract();

    //   const blockNode = createBlockNode(block);
    //   if (nodes.length === 1) {
    //     const node = nodes[0];
    //     if (node?.isEmpty && node.isEmpty()) {
    //       nodes[0].replace(blockNode);
    //     } else {
    //       $insertNodeToNearestRoot(blockNode);
    //     }
    //   } else {
    //     nodes.forEach((node) => selection.delete(node.getKey()));
    //     $insertNodeToNearestRoot(blockNode);
    //   }
    // });
  }

  return (
    <div className="blocks">
      <h3>Blocks</h3>
      <BlocksList blocks={blocks} onSelect={onSelectBlock} />
    </div>
  );
}
