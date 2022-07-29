import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Editor from "../../components/Editor";
import Preview from "../../components/Preview";

import { getBlob, postCommit, getBranch } from "../../services/api";

import { useQueryParams } from "../../store/queryParams";
import { useBranch } from "../../store/branch";

import "./style.scss";

function EditorPage() {
  const defaultContent = "# Loading file contents...";

  const [blob, setBlob] = useState({
    content: null,
    sha: null,
    frontmatter: null,
    path: null,
  });

  const [editorConent, setEditorContent] = useState(defaultContent);

  const [queryParams, setQueryParams] = useQueryParams();
  const [branch, setBranch] = useBranch();
  const navigate = useNavigate();

  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    setBlob({ ...blob, content: null });
    setEditorContent(defaultContent);
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

    return function () {
      getBranch().then(setBranch);
      console.log(queryParams.sha);
      // TODO: Control redundant branch loads when change file from directory (use the queryParams.path)
      // TODO: Debug what queryParams status is accessible from inside this context
    };
  }, [queryParams.sha]);

  useEffect(() => {
    setHasChanged(editorConent !== blob.content && editorConent !== defaultContent);
  }, [editorConent]);

  function saveBlob({ sha, path }) {
    postCommit({ content: btoa(editorConent), path, sha }).then(commit => {
      navigate("/edit", { search: `?sha=${commit.sha}&path=${path}` });
    });
  }

  return (
    <>
      <div className="edit__content">
        <Editor
          onUpdate={setEditorContent}
          content={editorConent}
          defaultContent={defaultContent}
        />
        <Preview text={editorConent} />
      </div>
      <div className="edit__controls">
        <a
          className={"btn" + (hasChanged ? "" : " disabled")}
          onClick={() =>
            saveBlob(Object.fromEntries(new URLSearchParams(location.search).entries()))
          }
        >
          Save
        </a>
      </div>
    </>
  );
}

export default EditorPage;
