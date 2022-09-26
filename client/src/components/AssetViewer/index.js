import React from "react";
import "./style.scss";

export default function AssetViewer({ path, content, encoding }) {
  const title = path ? path.split("/").pop() : "";
  const extension = title.split(".").pop();
  const imageSrc = content ? `data:image/${extension};base64,${content}` : "";
  return (
    <div className="asset-viewer">
      <h2>{title}</h2>
      <figure className="asset-viewer__image">
        <img src={imageSrc} />
      </figure>
    </div>
  );
}
