import React from "react";

import { marked } from "marked";
marked.setOptions({
  breaks: false,
  sanitize: true,
  sanitizer: DOMPurify.sanitize,
  smartLists: true,
  //smartypants: true,
});
import DOMPurify from "dompurify";
const markdown = {
  makeHtml: text => marked.parse(text),
};

export default function Preview({ text }) {
  return (
    <div id="preview" dangerouslySetInnerHTML={{ __html: markdown.makeHtml(text) }}></div>
  );
}
