/* VENDOR */
import React, { useEffect, useState } from "react";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

/* SOURCE */
import EditorFocus, { useEditorFocus } from "context/EditorFocus";
import CodeHighlightPlugin from "plugins/CodeHighlight";
import ListMaxIndentLevelPlugin from "plugins/ListMaxIndentLevelPlugin";
import BlockNodesPlugin from "plugins/BlockNodesPlugin";
import EditorSidebar from "components/EditorSidebar";
import ToolbarPlugin from "plugins/ToolbarPlugin";

/* STYLE */
import "./style.scss";
import "./lexical.scss";

function EditorToolbar() {
  const [focusNode] = useEditorFocus();
  const [editor, setEditor] = useState();
  useEffect(() => {
    setEditor(focusNode?.editor);
  }, [focusNode]);

  return (
    <div className="editor-toolbar">
      <ToolbarPlugin editor={editor} />
    </div>
  );
}

export default function Editor() {
  const [editor] = useLexicalComposerContext();

  return (
    <EditorFocus>
      <div className="editor-container">
        <EditorToolbar />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="vocero-root-editor" />}
            placeholder={<div>Loading file contents...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <CodeHighlightPlugin />
          <ListPlugin />
          <LinkPlugin />
          <ListMaxIndentLevelPlugin maxDepth={7} />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <BlockNodesPlugin editor={editor} />
        </div>
      </div>
      <EditorSidebar />
    </EditorFocus>
  );
}
