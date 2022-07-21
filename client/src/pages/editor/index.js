import React, { useState } from "react";
import { createRoot } from "react-dom/client";

import Editor from "../../components/Editor/index.js";
import Preview from "../../components/Preview/index.js";
import QueryParams from "../../components/QueryParams.js";

import QueryParamsContext from "../../store/QueryParams.js";

import "./index.css";

const root = createRoot(document.querySelector(".edit-page"));

function App() {
  const blob = document.getElementById("blob");
  const [editorConent, setEditorContent] = useState(blob.innerHTML);

  function onUpdate(content) {
    setEditorContent(content);
  }

  function onSubmit({ sha, path, onCommit }) {
    fetch("/api/commit.php", {
      method: "POST",
      body: JSON.stringify({
        "path": path,
        "content": btoa(editorConent),
        "blob": sha,
      }),
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Accept": "application/json",
      },
    })
      .then(res => res.json())
      .then(data => {
        onCommit({ "sha": data.blob.sha });
      });
  }

  return (
    <QueryParams>
      <Editor onUpdate={onUpdate} blobContent={blob.innerHTML} />
      <Preview text={editorConent} />
      <QueryParamsContext.Consumer>
        {([queryParams, setQueryParams]) => (
          <a
            className="btn"
            onClick={() => onSubmit({ ...queryParams, onCommit: setQueryParams })}
          >
            Save
          </a>
        )}
      </QueryParamsContext.Consumer>
    </QueryParams>
  );
}

root.render(<App />);
