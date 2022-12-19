/* VENDOR */
import React from "react";
import "./style.scss";

/* SOURCE */
import { useStore } from "colmado";

export default function Blocks({ onSelect }) {
  const [{ blocks }] = useStore();

  function blocksList() {
    if (!blocks) return [];
    return blocks.map((block, i) => (
      <li key={i} onClick={() => onSelect(block)}>
        {block.name}
      </li>
    ));
  }

  return (
    <div className="blocks">
      <ul>{blocksList()}</ul>
    </div>
  );
}
