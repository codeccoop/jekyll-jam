/* VENDOR */
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
import { $getNodeByKey, $getSelection } from "lexical";

/* SOURCE */
import CodeHighlightPlugin from "plugins/CodeHighlight.js";
import ListMaxIndentLevelPlugin from "plugins/ListMaxIndentLevelPlugin.js";
import ToolbarPlugin from "plugins/ToolbarPlugin";
import BlockNodesPlugin from "plugins/BlockNodesPlugin.js";
import { useEditorFocus } from "context/EditorFocus";

function BlockEditor({ editor, parentEditor, hierarchy = [] }) {
  const [focusNode] = useEditorFocus();

  const isComposing = useRef(false);
  useEffect(() => {
    if (!focusNode) {
      isComposing.current = false;
    } else {
      new Promise((res) => {
        parentEditor.getEditorState().read(() => {
          const node = $getNodeByKey(focusNode.getKey());
          if (!node) rej();
          editor.getEditorState().read(() => {
            const selection = $getSelection();
            if (!selection) rej();
            res();
          });
        });
      })
        .then(() => (isComposing.current = true))
        .catch(() => (isComposing.current = false));
    }
  }, [editor, parentEditor, focusNode]);

  return (
    <>
      {isComposing.current &&
        createPortal(
          <ToolbarPlugin />,
          document.querySelector(".editor-toolbar")
        )}
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

  useEffect(() => {
    if (!defn) return;
    parentEditor.update(() => {
      const node = $getNodeByKey(nodeKey);
      node.props = Object.fromEntries(
        defn.args.map((a) => [a, props[a] || null])
      );
    });
  }, [defn]);

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
