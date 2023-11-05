/* VENDOR */
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/* SOURCE */
import { b64e } from "utils";

export default function File({ sha, path, name, isNew, createFile, dropFile }) {
  const input = useRef();
  const unliked = useRef(false);
  const type = name.match(/\.(\w+)$/)[1];

  function onCreateFile(ev) {
    if (ev.type === "keydown" && ev.code !== "Enter") return;
    ev.stopPropagation();
    if (unliked.current) return;
    unliked.current = true;

    const value = ev.target.value.trim();
    const fileName = `${value}.${type}`;
    createFile(ev, {
      path: path.replace(/new_file\.\w+$/, fileName),
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
        onKeyDown={onCreateFile}
        onBlur={onCreateFile}
        defaultValue={name.replace(/\.\w+$/, "")}
      />
    );
  }

  return (
    <>
      <Link
        id={sha}
        to={"/edit?sha=" + encodeURIComponent(sha) + "&path=" + b64e(path)}
      >
        {name.replace(/\.\w+$/, "")}
      </Link>
      <button className="drop" onClick={dropFile}></button>
    </>
  );
}
