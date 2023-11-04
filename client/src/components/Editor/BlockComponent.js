/* VENDOR */
import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext.js";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { TRANSFORMERS } from "@lexical/markdown";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin.js";
import { ListPlugin } from "@lexical/react/LexicalListPlugin.js";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin.js";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin.js";
import { useStore } from "colmado";

/* SOURCE */
import CodeHighlightPlugin from "plugins/CodeHighlight.js";
import ListMaxIndentLevelPlugin from "plugins/ListMaxIndentLevelPlugin.js";
// import ToolbarPlugin from "plugins/ToolbarPlugin";
import BlockNodesPlugin from "plugins/BlockNodesPlugin.js";

function BlockEditor({ editor, parentEditor, hierarchy = [] }) {
  return (
    <>
      <RichTextPlugin
        contentEditable={<ContentEditable className="vocero-block-editor" />}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <CodeHighlightPlugin />
      <ListPlugin />
      <LinkPlugin />
      <ListMaxIndentLevelPlugin maxDepth={7} />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <BlockNodesPlugin
        editor={editor}
        parentEditor={parentEditor}
        hierarchy={hierarchy}
      />
    </>
  );
}

function BlockComponent({
  nodeKey,
  defn,
  editor,
  parentEditor,
  ancestors,
  props = {},
}) {
  const [{ blocks }] = useStore();
  const [, { getTheme }] = useLexicalComposerContext();

  const BlockInner =
    blocks.find((block) => block.name === defn.name)?.fn || (() => {});

  if (defn.selfClosed) return <BlockInner {...props} React={React} />;

  return (
    <LexicalNestedComposer initialEditor={editor} initialTheme={getTheme()}>
      {/* focus && <ToolbarPlugin /> */}
      <BlockInner {...props} React={React}>
        <BlockEditor
          editor={editor}
          parentEditor={parentEditor}
          hierarchy={ancestors.concat(nodeKey)}
        />
      </BlockInner>
    </LexicalNestedComposer>
  );
}

export default BlockComponent;
