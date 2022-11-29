import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { commit } from "../../services/api";

export default function File({ sha, path, name, is_new, fetchTree }) {
  const [fileName, setFileName] = useState(name);
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (el) el.focus();
  }, []);

  function commitFileName(ev) {
    if (ev.keyCode === 13 || ev.type === "blur") {
      const el = elRef.current;
      commit({
        content: "",
        path: btoa(path.replace(/((?![^\/]+\/)\/?.)+$/, fileName)),
        sha: sha,
      }).then((commit) => {
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
        onChange={(ev) => setFileName(ev.target.value)}
        onKeyDown={commitFileName}
        onBlur={commitFileName}
        value={fileName}
      />
    );
  }

  return (
    <Link
      id={sha}
      to={
        "/edit?sha=" + encodeURIComponent(sha) + "&path=" + encodeURIComponent(btoa(path))
      }
    >
      {fileName}
    </Link>
  );
}
