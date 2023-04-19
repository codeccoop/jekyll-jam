/* VENDOR */
import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useStore } from "colmado";

/* SOURCE */
import { INSERT_BLOCK_NODE } from "../Editor/plugins/BlockNodesPlugin";

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

  function onSelectBlock(block) {
    editor.dispatchCommand(INSERT_BLOCK_NODE, { defn: block });
  }

  return (
    <div className="blocks">
      <h3>Blocks</h3>
      <BlocksList blocks={blocks} onSelect={onSelectBlock} />
    </div>
  );
}
