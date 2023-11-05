/* VENDOR */
import React, { useEffect, useState } from "react";
import { $getNodeByKey } from "lexical";

/* SOURCE */
import { $isBlockNode } from "nodes/BlockNode";
import { useEditorFocus } from "context/EditorFocus";

/* STYLE */
import "./style.scss";

function propsHasChanged(from, to) {
  return (
    Object.keys(to).length !== Object.keys(from).length ||
    Object.keys(to).reduce((handle, k) => {
      return handle || to[k] !== from[k];
    }, false)
  );
}

function BlockControl({ name, value, setValue }) {
  return (
    <div className="block-controls__field">
      <label htmlFor={name}>{name}</label>
      <input
        type="text"
        name={name}
        value={value || ""}
        onInput={(ev) => setValue(ev.target.value)}
      />
    </div>
  );
}

function BlockControls() {
  const [block, setBlock] = useEditorFocus();

  const handleDelete = () => {
    block.editor._parentEditor.update(() => {
      const node = $getNodeByKey(block.getKey());
      if ($isBlockNode(node)) {
        node.remove();
        setBlock(null);
      }
    });
  };

  const [props, setProps] = useState(
    Object.assign({}, block ? block.props : {})
  );
  useEffect(() => {
    if (Object.keys(props).length === 0) return;
    if (!propsHasChanged(block.props, props)) return;

    block.editor._parentEditor.update(() => {
      block.props = { ...block.props, ...props };
    });
  }, [props]);

  useEffect(() => {
    if (!block) return;
    setProps(block.props);
    return () => setProps({});
  }, [block]);

  return (
    <div className="block-controls">
      {block && block.defn.family !== "root" ? (
        <>
          <h3>{block.defn.name}</h3>
          <form>
            {Object.entries(props).map((prop, i) => (
              <BlockControl
                key={`${prop[0]}-${i}`}
                name={prop[0]}
                value={prop[1]}
                setValue={(val) => setProps({ ...props, [prop[0]]: val })}
              />
            ))}
          </form>
          <button onClick={handleDelete}>DELETE</button>
        </>
      ) : (
        <h3>Select one block</h3>
      )}
    </div>
  );
}

export default BlockControls;
