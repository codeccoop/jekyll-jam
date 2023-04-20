/* VENDOR */
import React, { useEffect, useRef, useState } from "react";
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

function BlockControl({ name, value, setValue }) {
  return (
    <>
      <label htmlFor={name}>{name}</label>
      <input
        type="text"
        name={name}
        value={value || ""}
        onChange={(ev) => setValue(ev.target.value)}
      />
    </>
  );
}

function BlockControls({ state, parentEditor, nodeKey }) {
  const [values, setValues] = state;

  const handleDelete = () => {
    parentEditor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isBlockNode(node)) {
        node.remove();
      }
    });
  };

  return (
    <div className="vocero-block__controls">
      <form>
        {Object.entries(values).map((prop, i) => (
          <BlockControl
            key={`${prop[0]}-${i}`}
            name={prop[0]}
            value={prop[1]}
            setValue={(val) => setValues({ ...values, [prop[0]]: val })}
          />
        ))}
      </form>
      <button onClick={handleDelete}>DELETE</button>
    </div>
  );
}

function BlockEditor({ hierarchy }) {
  return (
    <>
      <RichTextPlugin
        contentEditable={<ContentEditable className="block-editor-input" />}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <CodeHighlightPlugin />
      <ListPlugin />
      <LinkPlugin />
      <ListMaxIndentLevelPlugin maxDepth={7} />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <BlockNodesPlugin hierarchy={hierarchy} />
    </>
  );
}

function BlockComponent({
  nodeKey,
  defn,
  editor,
  parentEditor,
  ancestors,
  initProps = {},
  // focus = false,
}) {
  const [{ blocks }] = useStore();
  const blockRegistry = useBlockRegistryContext();
  const [, { getTheme }] = useLexicalComposerContext();
  const wrapper = useRef();

  const BlockInner =
    blocks.find((block) => block.name === defn.name)?.fn || (() => {});

  useEffect(() => {
    const dom = ancestors.length === 0 && wrapper.current;
    blockRegistry[nodeKey] = {
      dom,
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

  return (
    <LexicalNestedComposer initialEditor={editor} initialTheme={getTheme()}>
      {
        <BlockControls
          args={defn.args}
          state={[state, setState]}
          parentEditor={parentEditor}
          nodeKey={nodeKey}
        />
      }
      {/* focus && <ToolbarPlugin /> */}
      <div className="vocero-block-wrapper" ref={wrapper}>
        <BlockInner {...state} React={React}>
          {!defn.selfClosed && (
            <BlockEditor hierarchy={ancestors.concat(nodeKey)} />
          )}
        </BlockInner>
      </div>
    </LexicalNestedComposer>
  );
}

export default BlockComponent;
