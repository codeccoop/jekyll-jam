/* VENDOR */
import React, { useState, useEffect, useRef } from "react";
import { useStore } from "colmado";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";

/* SOURCE */
import Editor from "components/Editor";
import Preview from "components/Preview";
import AssetViewer from "components/AssetViewer";
import YamlForm from "components/YamlForm";

import { getBlob, getStyle } from "services/api";
import { hydrateBlocks, renderBlocks } from "lib/blocks";
import { b64d, b64e } from "lib/helpers";
import {
  genBlockTransformer,
  genBlockSerializer,
} from "lib/markdownTransformers";
import useMarked from "hooks/useMarked";
import { useBlockRegistryContext } from "lib/contexts/BlockRegistry";

/* STYLE */
import "./style.scss";

function getEditMode(queryPath) {
  let path;
  try {
    path = b64d(queryPath);
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

const defaultContent = "# Loading file contents...";

function EditComponent({ mode, content, setContent, blob }) {
  switch (mode) {
    case "editor":
      return <Editor content={content} defaultContent={defaultContent} />;
    case "data":
      return <YamlForm onUpdate={setContent} content={content} />;
    case "asset":
      return (
        <AssetViewer
          content={blob.content}
          encoding={blob.encoding}
          path={blob.path}
        />
      );
  }
}

function EditorPage() {
  const marked = useMarked();
  const [editor] = useLexicalComposerContext();
  const blocksRegistry = useBlockRegistryContext();
  const [{ query, changes, branch }, dispatch] = useStore();

  const [blob, setBlob] = useState({
    content: null,
    sha: null,
    frontmatter: null,
    path: null,
    encoding: null,
  });

  const isContentLoaded = useRef(false);
  const [editorContent, setEditorContent] = useState(defaultContent);
  const [previewContent, setPreviewContent] = useState(null);
  useEffect(() => {
    if (
      !isContentLoaded.current ||
      (isContentLoaded.current && editorContent === defaultContent)
    ) {
      editor.update(() => {
        $convertFromMarkdownString(editorContent, [
          ...TRANSFORMERS,
          genBlockSerializer(),
        ]);
      });
    }

    return () => (isContentLoaded.current = editorContent !== defaultContent);
  }, [editorContent]);

  useEffect(() => {
    if (!branch) return;
    getStyle(branch.sha).then((res) => {
      dispatch({
        action: "STORE_CSS",
        payload: res,
      });
    });
  }, [branch]);

  useEffect(() => {
    setBlob({ ...blob, content: null });
    setEditorContent(defaultContent);
    if (query.sha) retriveBlob();
  }, [query.sha]);

  const [preview, setPreview] = useState(false);
  useEffect(() => {
    if (preview) {
      editor.getEditorState().read(() => {
        setPreviewContent(
          $convertToMarkdownString([
            ...TRANSFORMERS,
            genBlockTransformer(blocksRegistry),
          ])
        );
      });
    }
    return () => {
      setPreviewContent(null);
    };
  }, [preview]);

  const [hasChanged, setHasChanged] = useState(false);
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

    editor.getEditorState().read(() => {
      const content = $convertToMarkdownString([
        ...TRANSFORMERS,
        genBlockTransformer(blocksRegistry),
      ]);

      dispatch({
        action: "ADD_CHANGE",
        payload: {
          sha,
          path,
          content: b64e(renderBlocks(content, marked)), // .replace(/\n|\r/g, "\n")),
          frontmatter: blob.frontmatter,
        },
      });
    });
  }

  async function retriveBlob() {
    let blob = changes.find((d) => d.sha === query.sha);
    if (!blob) {
      blob = await getBlob(query);
    } else {
      blob = JSON.parse(JSON.stringify(blob));
    }

    let editorContent = b64d(blob.content);
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
          preview && previewContent ? " preview" : "edit",
        ].join(" ")}
      >
        <EditComponent
          mode={getEditMode(query.path)}
          content={editorContent}
          setContent={setEditorContent}
          blob={blob}
        />
        {preview && previewContent && <Preview text={previewContent} />}
      </div>
      <div className="edit__controls">
        <a className="btn" onClick={toTheClippBoard}>
          Get URL
        </a>
        <a className="btn" onClick={() => setPreview(!preview)}>
          {preview ? "Edit" : "Preview"}
        </a>
        <a
          className={"btn" + (hasChanged || true ? "" : " disabled")}
          onClick={storeEdit}
        >
          Save
        </a>
      </div>
    </>
  );
}

export default EditorPage;
