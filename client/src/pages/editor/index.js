import React, { useState } from "react";
import { createRoot } from "react-dom/client";

import Editor from "../../components/Editor/index.js";
import Preview from "../../components/Preview/index.js";

import "./index.css";

const root = createRoot(document.querySelector(".edit-page"));

function App() {
  const blob = document.getElementById("blob");
  const filename = blob.dataset.filename;
  const sha = blob.dataset.sha;
  const [editorConent, setEditorContent] = useState("");

  function onUpdate(content) {
    setEditorContent(content);
  }

  function onSubmit() {
    fetch("/api/commit.php", {
      method: "POST",
      body: JSON.stringify({
        "filename": filename,
        "content": btoa(editorConent),
        "blob": sha,
      }),
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Accept": "application/json",
      },
    })
      .then(res => res.json())
      .then(console.log);
  }

  return (
    <>
      <Editor onUpdate={onUpdate} blobContent={blob.innerHTML} />
      <Preview text={editorConent} blobContent={blob.innerHTML} />
      <a className="btn" onClick={onSubmit}>
        Save
      </a>
    </>
  );
}

root.render(<App />);
