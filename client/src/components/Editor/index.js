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

/* SOURCE */
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlight";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
// import MarkdownCodecPlugin from "./plugins/MarkdownCodecPlugin";
import BlockNodesPlugin from "./plugins/BlockNodesPlugin";

// import EditorContext from "./context";
import Blocks from "components/Blocks";

/* STYLE */
import "./style.scss";
import "./lexical.scss";

export default function Editor({ content, defaultContent }) {
  content = content !== null ? content : defaultContent;

  return (
    <>
      {/* <EditorContext> */}
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <CodeHighlightPlugin />
          <ListPlugin />
          <LinkPlugin />
          <ListMaxIndentLevelPlugin maxDepth={7} />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          {/* <MarkdownCodecPlugin /> */}
          <BlockNodesPlugin />
        </div>
      </div>
      <Blocks />
      {/* </EditorContext> */}
    </>
  );
}
