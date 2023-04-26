/* VENDOR */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* SOURCE */
import { commit } from "services/api";
import { b64e } from "lib/helpers";

export default function File({ sha, path, name, is_new, fetchTree }) {
  const [fileName, setFileName] = useState(name);
  const elRef = useRef();

  useEffect(() => {
    const el = elRef.current;
    if (el) el.focus();
  }, []);

  function commitFileName(ev) {
    if (ev.keyCode === 13 || ev.type === "blur") {
      const el = elRef.current;
      const fileName = ev.target.value;
      commit([
        {
          content: "",
          path: b64e(fileName.replace(/^\/*/, "")),
          frontmatter: [],
        },
      ]).then((commit) => {
        fetchTree();
        el.blur();
      });
    }
  }

  if (is_new) {
    return (
      <input
        ref={elRef}
        type="text"
        onKeyDown={commitFileName}
        onBlur={commitFileName}
        defaultValue={fileName}
      />
    );
  }

  return (
    <Link
      id={sha}
      to={"/edit?sha=" + encodeURIComponent(sha) + "&path=" + b64e(path)}
    >
      {fileName}
    </Link>
  );
}
