import React, { useState, useEffect } from "react";

import Editor from "../../components/Editor";
import Preview from "../../components/Preview";
import AssetViewer from "../../components/AssetViewer";
import YamlForm from "../../components/YamlForm";

import { getBlob, getBranch } from "../../services/api";

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

  const [editorContent, setEditorContent] = useState(defaultContent);

  const [{ query, changes }, dispatch] = useStore();

  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    // Wait until changes store was rendered
    if (changes === void 0) return;

    setBlob({ ...blob, content: null });
    setEditorContent(defaultContent);
    if (query.sha) {
      retriveBlob()
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
  }, [query.sha, changes]);

  useEffect(() => {
    setHasChanged(editorContent !== blob.content && editorContent !== defaultContent);
  }, [editorContent]);

  function storeEdit() {
    const { sha, path } = Object.fromEntries(
      new URLSearchParams(location.search).entries()
    );
    dispatch({
      action: "ADD_CHANGE",
      payload: {
        content: editorContent.replace(/\n/g, "\n"),
        frontmatter: blob.frontmatter,
        sha,
        path,
      },
    });
  }

  function refreshBranch() {
    return getBranch().then((branch) => {
      dispatch({
        action: "SET_BRANCH",
        payload: branch,
      });
    });
  }

  function retriveBlob() {
    const edit = changes.find((d) => d.sha === query.sha);
    if (edit) return Promise.resolve(edit);
    return getBlob(query);
  }

  return (
    <>
      <div className={"edit__content " + getMode(query.path)}>
        {getMode(query.path) === "editor" ? (
          <Editor
            onUpdate={setEditorContent}
            content={editorContent}
            defaultContent={defaultContent}
          />
        ) : getMode(query.path) === "data" ? (
          <YamlForm content={editorContent} />
        ) : (
          <AssetViewer content={blob.content} encoding={blob.encoding} path={blob.path} />
        )}
        <Preview text={editorContent} />
      </div>
      <div className="edit__controls">
        <a className={"btn" + (hasChanged ? "" : " disabled")} onClick={storeEdit}>
          Save
        </a>
      </div>
    </>
  );
}

export default EditorPage;
