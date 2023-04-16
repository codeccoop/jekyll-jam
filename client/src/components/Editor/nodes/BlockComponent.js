import React, { forwardRef, useEffect, useRef, useState } from "react";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { TRANSFORMERS } from "@lexical/markdown";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin.js";
import { ListPlugin } from "@lexical/react/LexicalListPlugin.js";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin.js";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin.js";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { useStore } from "colmado";

import baseTheme from "../theme";
import CodeHighlightPlugin from "../plugins/CodeHighlight.js";
import ListMaxIndentLevelPlugin from "../plugins/ListMaxIndentLevelPlugin.js";
import ToolbarPlugin from "../plugins/ToolbarPlugin";
import BlockNodesPlugin from "../plugins/BlockNodesPlugin";
import { useEditorContext } from "../context";

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

function BlockControls({ state }) {
  const [values, setValues] = state;
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
      <AutoFocusPlugin />
      <CodeHighlightPlugin />
      <ListPlugin />
      <LinkPlugin />
      <ListMaxIndentLevelPlugin maxDepth={7} />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <BlockNodesPlugin hierarchy={hierarchy} />
    </>
  );
}

function BlockComponent({ defn, editor, blockID, ancestors, focus = false }) {
  const [{ blocks }] = useStore();

  const blockRender = blocks.find((block) => block.name === defn.name).fn;
  let BlockInner;
  if (ancestors.length) {
    BlockInner = ({ props, children }) => blockRender({ props, React, children }, null);
  } else {
    BlockInner = forwardRef(({ props, children }, ref) => {
      return blockRender({ ...props, React, children }, ref);
    });
  }
  const blockContent = useRef();
  const [, addBlockContent] = useEditorContext();
  useEffect(() => {
    ancestors.length === 0 && addBlockContent(blockID, blockContent);
  }, []);

  const [state, setState] = useState({});
  useEffect(() => {
    if (!defn) return;
    setState(Object.fromEntries(defn.args.map((a) => [a, null])));
  }, [defn]);

  return (
    <LexicalNestedComposer initialEditor={editor} initialTheme={baseTheme}>
      {focus && <BlockControls args={defn.args} state={[state, setState]} />}
      {focus && <ToolbarPlugin />}
      <BlockInner props={state} ref={blockContent}>
        {!defn.selfClosed && <BlockEditor hierarchy={ancestors.concat(blockID)} />}
      </BlockInner>
    </LexicalNestedComposer>
  );
}

export default BlockComponent;
