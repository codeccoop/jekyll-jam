/* VENDOR */
import React, { useState, useEffect, useRef } from "react";
import { useStore } from "colmado";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";

/* SOURCE */
import Editor from "components/Editor";
import Preview from "components/Preview";
import MediaViewer from "components/MediaViewer";
import YamlForm from "components/YamlForm";

import { getBlob, getStyle } from "services/api";
import { b64d, b64e } from "lib/helpers";

/* STYLE */
import "./style.scss";
import { $getRoot, $insertNodes } from "lexical";

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

function EditComponent({ mode, content, setContent, blob }) {
  switch (mode) {
    case "editor":
      return <Editor />;
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
  const [editor] = useLexicalComposerContext();
  const [{ blocks, query, changes, branch }, dispatch] = useStore();

  const [blob, setBlob] = useState({});

  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [editorContent, setEditorContent] = useState();
  const [previewContent, setPreviewContent] = useState();
  useEffect(() => {
    setIsContentLoaded(!!editorContent);
    return () => {
      setIsContentLoaded(false);
    };
  }, [editorContent]);

  useEffect(() => {
    if (isContentLoaded && blocks.length) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(editorContent, "text/html");
        dom._vBlocks = blocks;
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.getChildren().forEach((child) => child.remove());
        root.select();
        $insertNodes(nodes);
      });
    }
  }, [blocks, isContentLoaded]);

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
    if (query.sha) retriveBlob(changes);
    return () => {
      setEditorContent(null);
      setBlob({ ...blob, content: null });
    };
  }, [query.sha]);

  const [preview, setPreview] = useState(false);
  useEffect(() => {
    if (preview) {
      editor.getEditorState().read(() => {
        editor._vBlocks = blocks;
        setPreviewContent($generateHtmlFromNodes(editor));
      });
    }
    return () => {
      setPreviewContent(null);
    };
  }, [preview]);

  const [hasChanged, setHasChanged] = useState(false);
  useEffect(() => {
    if (getEditMode(query.path) === "media" || !isContentLoaded) return;
    const hasChanged = b64e(editorContent) !== blob.content;
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
      editor._vBlocks = blocks;
      const content = $generateHtmlFromNodes(editor);

      dispatch({
        action: "ADD_CHANGE",
        payload: {
          sha,
          path,
          content: b64e(content),
          frontmatter: blob.frontmatter || [],
          encoding: blob.encoding || "base64",
        },
      });
    });
  }

  function onSave(ev, blob) {
    if (ev.key === "s" && ev.ctrlKey) {
      ev.preventDefault();
      ev.stopPropagation();
      storeEdit(blob);
    }
  }

  const onSaveInterceptor = useRef((ev) => {
    if (ev.key === "s" && ev.ctrlKey) {
      if (!el.current.contains(ev.target)) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    }
  });

  useEffect(() => {
    if (getEditMode(query.path) === "media") return;
    document.body.addEventListener("keydown", onSaveInterceptor.current, true);
    return () => {
      document.body.removeEventListener(
        "keydown",
        onSaveInterceptor.current,
        true
      );
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

    // if (mode === "editor") {
    //   editorContent = hydrateBlocks(editorContent);
    // }

    setBlob(blob);
    setEditorContent(editorContent);
  }

  function toTheClippBoard(blob) {
    navigator.clipboard.writeText(b64d(blob.path)); // .replace(/\.md$/, ".html"));
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
        onKeyDown={(ev) => onSave(ev, blob)}
      >
        <EditComponent
          mode={getEditMode(query.path)}
          content={editorContent}
          setContent={setEditorContent}
          blob={blob}
        />
        {preview && previewContent && <Preview html={previewContent} />}
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
