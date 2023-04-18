/* VENDOR */
import React, { useEffect, useRef } from "react";
import { useStore } from "colmado";

/* SOURCE */
import useMarked from "hooks/useMarked";

/* STYLE */
import "./style.scss";

function classedWrapper(text) {
  return `<main class="vocero-preview"><div class="vocero-preview__content">${text}</div></main>`;
}

export default function Preview({ text }) {
  const elRef = useRef();
  const shadowRef = useRef();
  const rendererRef = useRef(document.createElement("template"));
  const [{ style }] = useStore();
  const marked = useMarked();
  const css = style;

  useEffect(() => {
    const el = elRef.current.children[0];
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
    const contentWrapper = renderer.content.querySelector(".vocero-preview__wrapper");

    if (contentWrapper) {
      contentWrapper.innerHTML = marked.parse(text);
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
        className="preview-content"
        dangerouslySetInnerHTML={{ __html: classedWrapper(marked.parse(text)) }}
      ></div>
    </div>
  );
}
