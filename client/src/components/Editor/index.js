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
import BlockContentNode from "./nodes/BlockContentNode";
import BlockTokenNode from "./nodes/BlockTokenNode";
// import ParagraphBlockNode from "./nodes/ParagraphBlockNode";
import Blocks from "../Blocks";

/* STYLE */
import "./style.scss";
import "./lexical.scss";

// const history = [];
export default function Editor({ onUpdate, content, defaultContent }) {
  // const textAreaRef = useRef();

  // function update(value) {
  //   history.push(value);
  //   if (history.length > 50) {
  //     history.splice(0, 1);
  //   }
  //   onUpdate(value);
  // }

  // function onInput(ev) {
  //   update(ev.target.value);
  // }

  content = content !== null ? content : defaultContent;

  // function onKeyDown(ev) {
  //   const textArea = textAreaRef.current;
  //   if (ev.keyCode === 9) {
  //     ev.stopPropagation();
  //     ev.preventDefault();

  //     const cursor = textArea.selectionStart;
  //     textArea.value =
  //       textArea.value.slice(0, cursor) +
  //       "  " +
  //       textArea.value.slice(cursor, cursor + 1) +
  //       textArea.value.slice(cursor + 1);

  //     textArea.selectionStart = cursor + 2;
  //     textArea.selectionEnd = cursor + 2;
  //     update(textArea.value);
  //   } else if (ev.keyCode === 90) {
  //     history.pop();
  //     const stage = history.pop();
  //     if (stage) {
  //       textArea.value = stage;
  //       onUpdate(textArea.value);
  //     }
  //   }
  // }

  // function onSelectBlock(block) {
  //   let args = block.args.map((arg) => arg + '=""\n').join("  ");
  //   if (block.args.length) args = "\n  " + args;
  //   let mark = `<${block.name}${args}`;
  //   // if (block.selfClosed === true) mark += "/>";
  //   // else
  //   mark += `>\n</${block.name}>`;
  //   const textArea = textAreaRef.current;
  //   const cursor = textArea.selectionStart;
  //   textArea.value =
  //     textArea.value.slice(0, cursor).replace(/\n$/, "") +
  //     `\n${mark}\n` +
  //     textArea.value.slice(cursor + 1).replace(/^\n/, "");
  //   textArea.selectionStart = cursor + mark.length - 1;
  //   textArea.selectionEnd = cursor + mark.length - 1;
  //   update(textArea.value);
  // }

  // return (
  //   <div className="editor" onKeyDown={onKeyDown}>
  //     <textarea ref={textAreaRef} onInput={onInput} value={content}></textarea>
  //     <Blocks onSelect={onSelectBlock} />
  //   </div>
  // );

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
      BlockTokenNode,
      BlockContentNode,
      // ParagraphBlockNode,
    ],
  };

  return (
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
          <MarkdownCodecPlugin onUpdate={onUpdate} />
          <MarkdownInitialContentPlugin
            content={content}
            defaultContent={defaultContent}
          />
          <BlockNodesPlugin />
        </div>
      </div>
      <Blocks />
    </LexicalComposer>
  );
}
