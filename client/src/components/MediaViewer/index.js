/* VENDOR */
import React from "react";

/* STYLE */
import "./style.scss";

export default function MediaViewer({ path, content, encoding }) {
  const title = path ? path.split("/").pop() : "";
  const extension = title.split(".").pop();
  const imageSrc = content ? `data:image/${extension};base64,${content}` : "";
  return (
    <div className="media-viewer">
      <h2>{title}</h2>
      <figure className="media-viewer__image">
        <img src={imageSrc} />
      </figure>
    </div>
  );
}
