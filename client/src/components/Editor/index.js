/* VENDOR */
import React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS, $convertFromMarkdownString } from "@lexical/markdown";

/* THEME */
import theme from "./theme";

/* PLUGIS */
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlight";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import MarkdownCodecPlugin from "./plugins/MarkdownCodecPlugin";
import MarkdownInitialContentPlugin from "./plugins/MarkdownInitialStatePlugin";
import BlockNodesPlugin from "./plugins/BlockNodesPlugin";

/* NODES */
import BlockNode from "./nodes/BlockNode";

import EditorContext from "./context";
import Blocks from "../Blocks";

/* STYLE */
import "./style.scss";
import "./lexical.scss";

export default function Editor({ onPreview, setContent, content, defaultContent }) {
  content = content !== null ? content : defaultContent;

  const editorConfig = {
    editorState: () => $convertFromMarkdownString(content, TRANSFORMERS),
    theme: theme,
    onError(error) {
      console.error(error);
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
      BlockNode,
    ],
  };

  return (
    <EditorContext>
      <LexicalComposer initialConfig={editorConfig}>
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
            <MarkdownCodecPlugin onPreview={onPreview} setContent={setContent} />
            <MarkdownInitialContentPlugin
              content={content}
              defaultContent={defaultContent}
            />
            <BlockNodesPlugin />
          </div>
        </div>
        <Blocks />
      </LexicalComposer>
    </EditorContext>
  );
}
