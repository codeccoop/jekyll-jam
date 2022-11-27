import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Editor from "../../components/Editor";
import Preview from "../../components/Preview";
import AssetViewer from "../../components/AssetViewer";
import YamlForm from "../../components/YamlForm";

import { getBlob, commit, getBranch } from "../../services/api";

import { useStore } from "colmado";

import "./style.scss";

function getMode(queryPath) {
  let path;
  try {
    path = atob(queryPath);
  } catch (err) {
    return "editor";
  }
  if (path.match(/^\_data/)) {
    return "data";
  } else if (path.match(/^assets/)) {
    return "asset";
  } else {
    return "editor";
  }
}

function EditorPage() {
  const defaultContent = "# Loading file contents...";

  const [blob, setBlob] = useState({
    content: null,
    sha: null,
    frontmatter: null,
    path: null,
    encoding: null,
  });

  const [editorConent, setEditorContent] = useState(defaultContent);

  const [{ query }, dispatch] = useStore();
  const navigate = useNavigate();

  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    setBlob({ ...blob, content: null });
    setEditorContent(defaultContent);
    if (query.sha) {
      getBlob(query)
        .then((data) => {
          setBlob(data);
          if (getMode(query.path) === "editor") {
            setEditorContent(data.content);
          }
        })
        .catch((err) => {
          console.warn("Invalid JSON data");
        });
    }

    return function () {
      getBranch().then((branch) =>
        dispatch({
          action: "SET_BRANCH",
          payload: branch,
        })
      );
      // TODO: Control redundant branch loads when change file from directory (use the queryParams.path)
      // TODO: Debug what queryParams status is accessible from inside this context
    };
  }, [query.sha]);

  useEffect(() => {
    setHasChanged(editorConent !== blob.content && editorConent !== defaultContent);
  }, [editorConent]);

  function saveBlob({ sha, path }) {
    commit({ content: editorConent.replace(/\n/g, "\n"), path, sha }).then((commit) => {
      navigate("/edit", { search: `?sha=${commit.sha}&path=${path}` });
    });
  }

  return (
    <>
      <div className={"edit__content " + getMode(query.path)}>
        {getMode(query.path) === "editor" ? (
          <Editor
            onUpdate={setEditorContent}
            content={editorConent}
            defaultContent={defaultContent}
          />
        ) : getMode(query.path) === "data" ? (
          <YamlForm content={editorConent} />
        ) : (
          <AssetViewer content={blob.content} encoding={blob.encoding} path={blob.path} />
        )}
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
