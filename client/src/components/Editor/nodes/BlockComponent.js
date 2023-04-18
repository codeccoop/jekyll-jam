/* VENDOR */
import React, { useEffect, useRef, useState } from "react";
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
import BlockNodesPlugin from "../plugins/BlockNodesPlugin";

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
  defn,
  editor,
  blockID,
  ancestors,
  shareProps,
  initProps = {},
  editorState = {},
  focus = false,
}) {
  const [{ blocks }, dispatch] = useStore();
  const [, { getTheme }] = useLexicalComposerContext();

  useEffect(() => {
    if (Object.keys(editorState).length) {
      if (editorState.root.children.length === 0) {
        editorState.root.children.push({
          "children": [],
          "direction": "ltr",
          "format": "",
          "indent": 0,
          "type": "paragraph",
          "version": 1,
        });
      }
      const state = editor.parseEditorState(editorState);
      editor.setEditorState(state);
    }
  }, []);

  const BlockInner = blocks.find((block) => block.name === defn.name)?.fn || (() => {});
  const wrapper = useRef();
  useEffect(() => {
    const dom = ancestors.length === 0 && wrapper.current;
    dispatch({
      action: "ADD_BLOCK",
      payload: {
        id: blockID,
        dom: dom,
        defn: defn,
        props: state,
        editor: editor,
      },
    });
  }, [wrapper]);

  const [state, setState] = useState(initProps);
  useEffect(() => {
    if (!defn) return;
    setState(Object.fromEntries(defn.args.map((a) => [a, null])));
  }, [defn]);
  useEffect(() => {
    shareProps(state);
  }, [state]);

  return (
    <LexicalNestedComposer initialEditor={editor} initialTheme={getTheme()}>
      {focus && <BlockControls args={defn.args} state={[state, setState]} />}
      {/* focus && <ToolbarPlugin /> */}
      <div id={blockID} className="vocero-block-wrapper" ref={wrapper}>
        <BlockInner {...state} React={React}>
          {!defn.selfClosed && <BlockEditor hierarchy={ancestors.concat(blockID)} />}
        </BlockInner>
      </div>
    </LexicalNestedComposer>
  );
}

export default BlockComponent;
