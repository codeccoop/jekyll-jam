/* VENDOR */
import React, { useEffect, useState } from "react";
import { $getNodeByKey } from "lexical";
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
import CodeHighlightPlugin from "../plugins/CodeHighlight.js";
import ListMaxIndentLevelPlugin from "../plugins/ListMaxIndentLevelPlugin.js";
// import ToolbarPlugin from "../plugins/ToolbarPlugin";
import BlockNodesPlugin from "../plugins/BlockNodesPlugin.js";
import { $isBlockNode } from "./BlockNode.js";
import { useBlockRegistryContext } from "lib/contexts/BlockRegistry";

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
  focus,
  initProps = {},
}) {
  const [{ blocks }, dispatch] = useStore();
  const blockRegistry = useBlockRegistryContext();
  const [, { getTheme }] = useLexicalComposerContext();

  const BlockInner =
    blocks.find((block) => block.name === defn.name)?.fn || (() => {});

  useEffect(() => {
    blockRegistry[nodeKey] = {
      defn,
      editor,
      key: nodeKey,
      props: state,
    };
  }, [nodeKey]);

  const [state, setState] = useState(initProps);
  useEffect(() => {
    if (!defn) return;
    setState(Object.fromEntries(defn.args.map((a) => [a, null])));
  }, [defn]);

  useEffect(() => {
    parentEditor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isBlockNode(node)) {
        node.props = state;
      }
    });
  }, [state]);

  useEffect(() => {
    dispatch({
      action: "SET_BLOCK",
      payload: {
        defn: defn,
        nodeKey: nodeKey,
        props: state,
        setProps: (state) => setState(state),
        parentEditor: parentEditor,
      },
    });
  }, [focus]);

  return (
    <LexicalNestedComposer initialEditor={editor} initialTheme={getTheme()}>
      {/* focus && <ToolbarPlugin /> */}
      <BlockInner {...state} React={React}>
        {!defn.selfClosed && (
          <BlockEditor
            editor={editor}
            parentEditor={parentEditor}
            hierarchy={ancestors.concat(nodeKey)}
          />
        )}
      </BlockInner>
    </LexicalNestedComposer>
  );
}

export default BlockComponent;
