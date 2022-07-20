import React, { useEffect } from "react";
import "./index.css";

export default function Editor({ onUpdate, blobContent }) {
  function onInput(ev) {
    onUpdate(ev.target.value);
  }

  return (
    <div className="editor">
      <textarea onInput={onInput} defaultValue={blobContent}></textarea>
    </div>
  );
}
