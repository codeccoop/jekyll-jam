import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Editor from "../../components/Editor";
import Preview from "../../components/Preview";

import { getBlob, postCommit, postPull } from "../../services/api";

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
    if (queryParams.sha) {
      getBlob(queryParams.sha)
        .then(data => {
          setBlob(data);
          setEditorContent(data.content);
        })
        .catch(err => {
          console.warn("Invalid JSON data");
        });
    }
  }, [queryParams.sha]);

  function saveBlob({ sha, path }) {
    postCommit({ content: btoa(editorConent), path, sha }).then(commit => {
      navigate("/edit", { search: `?sha=${commit.sha}&path=${path}` });
    });
  }

  function publish() {
    postPull().then(console.log).catch(console.error);
  }

  return (
    <>
      <div className="edit__content">
        <Editor
          onUpdate={setEditorContent}
          content={editorConent}
          defaultContent={defaultEditorContent}
        />
        <Preview text={editorConent} />
      </div>
      <div className="edit__controls">
        <a
          className="btn"
          onClick={() =>
            saveBlob(Object.fromEntries(new URLSearchParams(location.search).entries()))
          }
        >
          Save
        </a>
        <a className="btn" onClick={publish}>
          Publish
        </a>
      </div>
    </>
  );
}

export default EditorPage;
