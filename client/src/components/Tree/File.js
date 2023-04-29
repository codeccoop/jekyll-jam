/* VENDOR */
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "colmado";

/* SOURCE */
import { b64e } from "lib/helpers";
import { createFile } from "./crud";

export default function File({ sha, path, name, isNew, dropFile }) {
  const input = useRef();
  const unliked = useRef(false);
  const [{ query }, dispatch] = useStore();
  const navigate = useNavigate();

  function commitFile(ev) {
    if (unliked.current) return;
    unliked.current = true;
    const fileName = ev.target.value;
    createFile({
      path: path.replace(/new_file\.\w+$/, fileName).replace(/^\/*/, ""),
    }).then((commit) => {
      const file = commit.changes[0];
      dispatch({
        action: "FETCH_BRANCH",
      });

      navigate(
        `/edit?sha=${encodeURIComponent(file.sha)}&path=${b64e(file.path)}`
      );
    });
  }

  useEffect(() => {
    isNew && input.current.focus();
  }, []);

  if (isNew) {
    return (
      <input
        ref={input}
        type="text"
        onKeyDown={(ev) => ev.code === "Enter" && commitFile(ev)}
        onBlur={commitFile}
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
