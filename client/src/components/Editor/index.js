import React from 'react';
import './style.scss';

export default function Editor({ onUpdate, content, defaultContent }) {
  function onInput(ev) {
    onUpdate(ev.target.value);
  }

  content = content ? content : defaultContent;

  return (
    <div className='editor'>
      <textarea onInput={onInput} value={content}></textarea>
    </div>
  );
}
