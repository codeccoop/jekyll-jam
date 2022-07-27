import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Editor from "../../components/Editor";
import Preview from "../../components/Preview";

import { getBlob, postCommit } from "../../services/api";

import QueryParamsContext from "../../store/queryParams";

import "./style.scss";

function EditorPage() {
  const loadingMessage = "Loading file content...";

  const defaultEditorContent = "# " + loadingMessage;
  const [blob, setBlob] = useState({
    content: null,
    sha: null,
    frontmatter: null,
    path: null,
  });

  const defaultBlobContent = `<h1 style='color: steelblue;'>${loadingMessage}</h1>`;
  const [editorConent, setEditorContent] = useState(defaultEditorContent);

  const [queryParams, setQueryParams] = useContext(QueryParamsContext);
  const navigate = useNavigate();

  useEffect(() => {
    setBlob({ ...blob, content: null });
    setEditorContent(defaultEditorContent);
    getBlob(queryParams.sha)
      .then(data => {
        setBlob(data);
        setEditorContent(data.content);
      })
      .catch(err => {
        console.warn("Invalid JSON data");
      });
  }, [queryParams.sha]);

  function onSubmit({ sha, path }) {
    postCommit(path, btoa(editorConent), sha).then(commit => {
      navigate("edit", { search: `?sha=${commit.sha}&path=${path}` });
    });
  }

  return (
    <>
      <div className="edit__content">
        <Editor
          onUpdate={setEditorContent}
          content={blob.content}
          defaultContent={defaultEditorContent}
        />
        <Preview text={editorConent} />
      </div>
      <div className="edit__controls">
        <a className="btn" onClick={() => onSubmit(new URLSearchParams(location.search))}>
          Save
        </a>
      </div>
    </>
  );
}

export default EditorPage;
