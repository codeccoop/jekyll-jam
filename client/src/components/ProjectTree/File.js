/* VENDOR */
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/* SOURCE */
import { b64e } from "utils";

export default function File({ sha, path, name, isNew, createFile, dropFile }) {
  const input = useRef();
  const unliked = useRef(false);

  function onCreateFile(ev) {
    ev.stopPropagation();
    if (unliked.current) return;
    unliked.current = true;

    createFile(ev, {
      path: path.replace(/new_file\.\w+$/, ev.target.value).replace(/^\/*/, ""),
      content: "",
    });
  }

  useEffect(() => {
    isNew && input.current.focus();
  }, []);

  if (isNew && !unliked.current) {
    return (
      <input
        ref={input}
        type="text"
        onKeyDown={(ev) => ev.code === "Enter" && onCreateFile(ev)}
        onBlur={onCreateFile}
        defaultValue={name}
      />
    );
  }

  return (
    <>
      <Link
        id={sha}
        to={"/edit?sha=" + encodeURIComponent(sha) + "&path=" + b64e(path)}
      >
        {name}
      </Link>
      <button className="drop" onClick={dropFile}></button>
    </>
  );
}
