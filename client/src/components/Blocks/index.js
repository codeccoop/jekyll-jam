/* VENDOR */
import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useStore } from "colmado";

/* SOURCE */
import { INSERT_BLOCK_NODE } from "plugins/BlockNodesPlugin";

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

function BlocksFamily({ name, blocks, onSelect }) {
  return (
    <div className="blocks-family">
      <h4>{name}</h4>
      <BlocksList blocks={blocks} onSelect={onSelect} />
    </div>
  );
}

export default function Blocks() {
  const [{ blocks }] = useStore();
  const [editor] = useLexicalComposerContext();

  function onSelectBlock(block) {
    editor.dispatchCommand(INSERT_BLOCK_NODE, { defn: block });
  }

  const families = blocks.reduce((families, block) => {
    if (block.family === "root") return families;
    families[block.family] = families[block.family] || [];
    families[block.family].push(block);
    return families;
  }, {});

  return (
    <div className="blocks">
      <h3>Blocks</h3>
      {Object.entries(families).map(([family, blocks]) => {
        return (
          <BlocksFamily
            key={family}
            blocks={blocks}
            name={family}
            onSelect={onSelectBlock}
          />
        );
      })}
    </div>
  );
}
