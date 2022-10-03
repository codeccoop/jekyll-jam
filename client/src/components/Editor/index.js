import React, { useRef } from 'react';
import './style.scss';

export default function Editor({ onUpdate, content, defaultContent }) {
  const textAreaRef = useRef();

  function onInput(ev) {
    onUpdate(ev.target.value);
  }

  content = content ? content : defaultContent;

  function onKeyDown(ev) {
    const textarea = textAreaRef.current;
    if (ev.keyCode === 9) {
      ev.stopPropagation();
      ev.preventDefault();

      const cursor = textarea.selectionStart;
      textarea.value =
        textarea.value.slice(0, cursor) +
        '  ' +
        textarea.value.slice(cursor, cursor + 1) +
        textarea.value.slice(cursor + 1);

      textarea.selectionStart = cursor + 2;
      textarea.selectionEnd = cursor + 2;
    }
  }

  return (
    <div className='editor' onKeyDown={onKeyDown}>
      <textarea ref={textAreaRef} onInput={onInput} value={content}></textarea>
    </div>
  );
}
