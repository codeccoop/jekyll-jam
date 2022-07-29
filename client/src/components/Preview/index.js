import React from "react";

import { marked } from "marked";
marked.setOptions({
  breaks: false,
  smartLists: true,
  //smartypants: true,
});

export default function Preview({ text }) {
  return (
    <div
      className="preview"
      dangerouslySetInnerHTML={{ __html: marked.parse(text) }}
    ></div>
  );
}
