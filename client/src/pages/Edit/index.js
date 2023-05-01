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
import MediaViewer from "components/MediaViewer";
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
  if (!queryPath) return null;

  let path;
  try {
    path = b64d(queryPath);
  } catch (err) {
    return "editor";
  }
  if (path.match(/^\_data/)) {
    return "data";
  } else if (path.match(/^assets/)) {
    return "media";
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
    case "media":
      return (
        <MediaViewer
          content={blob.content}
          encoding={blob.encoding}
          path={b64d(blob.path)}
        />
      );
  }
}

function EditorPage() {
  const el = useRef();
  const marked = useMarked();
  const [editor] = useLexicalComposerContext();
  const blocksRegistry = useBlockRegistryContext();
  const [{ query, changes, branch }, dispatch] = useStore();

  const [blob, setBlob] = useState({});

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
    if (query.sha) retriveBlob(changes);
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
      getEditMode(query.path) !== "media" &&
      editorContent !== defaultContent &&
      b64e(editorContent) !== blob.content;

    setHasChanged(hasChanged);
  }, [editorContent]);

  useEffect(() => {
    if (hasChanged && changes.length) retriveBlob(changes);
    setHasChanged(false);

    return () => {
      setHasChanged(true);
    };
  }, [changes]);

  function storeEdit(blob) {
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
          frontmatter: blob.frontmatter || [],
          encoding: blob.encoding || "base64",
        },
      });
    });
  }

  function onKeyDown(ev, blob) {
    if (ev.key === "s" && ev.ctrlKey) {
      ev.preventDefault();
      ev.stopPropagation();
      storeEdit(blob);
    }
  }

  const ctrlSListener = useRef((ev) => {
    if (ev.key === "s" && ev.ctrlKey) {
      if (!el.current.contains(ev.target)) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    }
  });
  useEffect(() => {
    if (getEditMode(query.path) === "media") return;
    document.body.addEventListener("keydown", ctrlSListener.current, true);
    return () => {
      document.body.removeEventListener("keydown", ctrlSListener.current, true);
    };
  }, []);

  async function retriveBlob(changes) {
    let blob = changes.find((d) => d.sha === query.sha);
    if (!blob) {
      blob = await getBlob(query);
    } else {
      blob = await new Promise((res) => {
        setTimeout(() => {
          res(JSON.parse(JSON.stringify(blob)));
        }, 0);
      });
    }

    const mode = getEditMode(query.path);
    let editorContent =
      mode === "media" ? window.atob(blob.content) : b64d(blob.content);

    if (mode === "editor") {
      editorContent = hydrateBlocks(editorContent);
    }

    setBlob(blob);
    setEditorContent(editorContent);
  }

  function toTheClippBoard(blob) {
    navigator.clipboard.writeText(b64d(blob.path).replace(/\.md$/, ".html"));
  }

  if (!query.path) return <h1>Loading</h1>;
  return (
    <>
      <div
        ref={el}
        className={[
          "edit__content",
          getEditMode(query.path),
          preview && previewContent ? " preview" : "edit",
        ].join(" ")}
        onKeyDown={(ev) => onKeyDown(ev, blob)}
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
        <a className="btn" onClick={() => toTheClippBoard(blob)}>
          Get URL
        </a>
        <a className="btn" onClick={() => setPreview(!preview)}>
          {preview ? "Edit" : "Preview"}
        </a>
        <a
          className={"btn" + (hasChanged || true ? "" : " disabled")}
          onClick={() => storeEdit(blob)}
        >
          Save
        </a>
      </div>
    </>
  );
}

export default EditorPage;
