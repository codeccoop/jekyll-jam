import React, { useEffect, useRef } from "react";

import { marked } from "marked";
import { useStore } from "colmado";
import { renderBlocks } from "../../utils/blocks";

marked.setOptions({
  breaks: false,
  smartLists: true,
  //smartypants: true,
});

export default function Preview({ text }) {
  const elRef = useRef();
  const shadowRef = useRef();
  const rendererRef = useRef(document.createElement("template"));
  const [store] = useStore();
  const css = store.style;

  useEffect(() => {
    const el = elRef.current;
    const html = el.innerHTML;
    const renderer = rendererRef.current;
    renderer.innerHTML = html;
    shadowRef.current = elRef.current.attachShadow({ mode: "open" });
    const shadow = shadowRef.current;
    shadow.appendChild(renderer.content);
    renderer.innerHTML = html;
  }, [elRef]);

  useEffect(() => {
    if (!(shadowRef.current && text)) return;
    const shadow = shadowRef.current;
    const renderer = rendererRef.current;
    const contentEl = renderer.content.querySelector(".previewContent");

    if (contentEl) {
      contentEl.innerHTML = renderBlocks(marked.parse(text), store.blocks);
      const rendererHTML = renderer.innerHTML;
      shadow.innerHTML = "";
      shadow.appendChild(renderer.content);
      renderer.innerHTML = rendererHTML;
    }
  }, [text]);

  useEffect(() => {
    if (!(shadowRef.current && css)) return;
    const shadow = shadowRef.current;
    const renderer = rendererRef.current;

    const style = document.createElement("style");
    if (style.styleSheet) style.styleSheet.cssText = css;
    else style.appendChild(document.createTextNode(css));

    renderer.content.prepend(style);
    const rendererHTML = renderer.innerHTML;
    shadow.innerHTML = "";
    shadow.appendChild(renderer.content);
    renderer.innerHTML = rendererHTML;
  }, [css]);

  return (
    <div ref={elRef} className="preview">
      <div
        className="previewContent"
        dangerouslySetInnerHTML={{
          __html: renderBlocks(marked.parse(text), store.blocks),
        }}
      ></div>
    </div>
  );
}
