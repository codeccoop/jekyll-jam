/* VENDOR */
import React from "react";
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
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlight";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import BlockNodesPlugin from "./plugins/BlockNodesPlugin";

import Toolbar from "components/Toolbar";

/* STYLE */
import "./style.scss";
import "./lexical.scss";

export default function Editor() {
  const [editor] = useLexicalComposerContext();

  return (
    <>
      <div className="editor-container">
        <ToolbarPlugin />
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
      <Toolbar />
    </>
  );
}
