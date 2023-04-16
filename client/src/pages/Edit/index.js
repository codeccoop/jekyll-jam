import React, { useState, useEffect } from "react";
import { useStore } from "colmado";

import Editor from "../../components/Editor";
import Preview from "../../components/Preview";
import AssetViewer from "../../components/AssetViewer";
import YamlForm from "../../components/YamlForm";

import { getBlob, getStyleURL } from "../../services/api";
import { hydrateBlocks, renderBlocks } from "../../lib/blocks";
import useMarked from "../../hooks/useMarked";

import "./style.scss";
import { useSearchParams } from "react-router-dom";

function getEditMode(queryPath) {
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

  const marked = useMarked();

  const [blob, setBlob] = useState({
    content: null,
    sha: null,
    frontmatter: null,
    path: null,
    encoding: null,
  });

  const [editorContent, setEditorContent] = useState(defaultContent);

  const [{ query, changes, style, branch }, dispatch] = useStore();

  useEffect(() => {
    if (!branch) return;
    getStyleURL(branch.sha).then((res) => {
      dispatch({
        action: "STORE_CSS",
        payload: res,
      });
    });
  }, [branch]);

  const [hasChanged, setHasChanged] = useState(false);

  const [preview, setPreview] = useState(false);

  useEffect(() => {
    setBlob({ ...blob, content: null });
    setEditorContent(defaultContent);
    if (query.sha) retriveBlob();
  }, [query.sha]);

  useEffect(() => {
    const hasChanged =
      getEditMode(query.path) !== "asset" &&
      editorContent !== defaultContent &&
      btoa(editorContent) !== blob.content;

    setHasChanged(hasChanged);
  }, [editorContent]);

  useEffect(() => {
    if (hasChanged && changes.length) {
      // Update after a 'save' a.k.a store changes. We have to reconciliate our editor content
      // and blob content because the second has been updated on the localStorage.
      retriveBlob();
      // setHasChanged(false);
    }
    // Case when changes were wipped after a commit.
    setHasChanged(false);

    return () => {
      // If changes will change, the view is 'saving' some content. HasChanged has to be true.
      setHasChanged(true);
    };
  }, [changes]);

  function storeEdit() {
    const { sha, path } = Object.fromEntries(
      new URLSearchParams(location.search).entries()
    );

    dispatch({
      action: "ADD_CHANGE",
      payload: {
        sha,
        path,
        content: btoa(renderBlocks(editorContent, marked)), // .replace(/\n|\r/g, "\n")),
        frontmatter: blob.frontmatter,
      },
    });
  }

  async function retriveBlob() {
    let blob = changes.find((d) => d.sha === query.sha);
    if (!blob) {
      blob = await getBlob(query);
    } else {
      blob = JSON.parse(JSON.stringify(blob));
    }

    let editorContent = atob(blob.content);
    if (getEditMode(query.path) === "editor") {
      editorContent = hydrateBlocks(editorContent);
    }

    setBlob(blob);
    setEditorContent(editorContent);
  }

  function toTheClippBoard() {
    navigator.clipboard.writeText("/" + blob.path.replace(/\.md$/, ".html"));
  }

  return (
    <>
      <div
        className={[
          "edit__content",
          getEditMode(query.path),
          preview ? " preview" : "edit",
        ].join(" ")}
      >
        {!preview ? (
          getEditMode(query.path) === "editor" ? (
            <Editor
              setContent={setEditorContent}
              content={editorContent}
              defaultContent={defaultContent}
              onPreview={preview}
            />
          ) : getEditMode(query.path) === "data" ? (
            <YamlForm onUpdate={setEditorContent} content={editorContent} />
          ) : (
            <AssetViewer
              content={blob.content}
              encoding={blob.encoding}
              path={blob.path}
            />
          )
        ) : (
          <Preview text={editorContent} />
        )}
      </div>
      <div className="edit__controls">
        <a className="btn" onClick={toTheClippBoard}>
          Get URL
        </a>
        <a className="btn" onClick={() => setPreview(preview)}>
          {preview ? "Edit" : "Preview"}
        </a>
        <a className={"btn" + (hasChanged ? "" : " disabled")} onClick={storeEdit}>
          Save
        </a>
      </div>
    </>
  );
}

export default EditorPage;
