import React, { useRef } from "react";
import "./style.scss";

import Blocks from "../Blocks";

const history = [];
export default function Editor({ onUpdate, content, defaultContent }) {
  const textAreaRef = useRef();

  function update(value) {
    history.push(value);
    if (history.length > 50) {
      history.splice(0, 1);
    }
    onUpdate(value);
  }

  function onInput(ev) {
    update(ev.target.value);
  }

  content = content ? content : defaultContent;

  function onKeyDown(ev) {
    const textArea = textAreaRef.current;
    if (ev.keyCode === 9) {
      ev.stopPropagation();
      ev.preventDefault();

      const cursor = textArea.selectionStart;
      textArea.value =
        textArea.value.slice(0, cursor) +
        "  " +
        textArea.value.slice(cursor, cursor + 1) +
        textArea.value.slice(cursor + 1);

      textArea.selectionStart = cursor + 2;
      textArea.selectionEnd = cursor + 2;
      update(textArea.value);
    } else if (ev.keyCode === 90) {
      history.pop();
      const stage = history.pop();
      if (stage) {
        textArea.value = stage;
        onUpdate(textArea.value);
      }
    }
  }

  function onSelectBlock(block) {
    let args = block.args.map((arg) => arg + '=""\n').join("  ");
    if (block.args.length) args = "\n  " + args;
    let mark = `<${block.name}${args}`;
    if (block.selfClosed === true) mark += "/>";
    else mark += `>\n\n</${block.name}>`;
    const textArea = textAreaRef.current;
    const cursor = textArea.selectionStart;
    textArea.value =
      textArea.value.slice(0, cursor).replace(/\n$/, "") +
      `\n${mark}\n` +
      textArea.value.slice(cursor + 1).replace(/^\n/, "");
    textArea.selectionStart = cursor + mark.length - 1;
    textArea.selectionEnd = cursor + mark.length - 1;
    update(textArea.value);
  }

  return (
    <div className="editor" onKeyDown={onKeyDown}>
      <Blocks onSelect={onSelectBlock} />
      <textarea ref={textAreaRef} onInput={onInput} value={content}></textarea>
    </div>
  );
}
