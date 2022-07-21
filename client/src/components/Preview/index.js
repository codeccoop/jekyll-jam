import React from "react";
import showdown from "showdown";
const markdown = new showdown.Converter();

export default function Preview({ text }) {
  return (
    <div id="preview" dangerouslySetInnerHTML={{ __html: markdown.makeHtml(text) }}></div>
  );
}
