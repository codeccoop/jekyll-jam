/* VENDOR */
import React, { useEffect, useState, useRef } from "react";
import { useStore } from "colmado";
import { $getNodeByKey } from "lexical";

/* SOURCE */
import { $isBlockNode } from "components/Editor/nodes/BlockNode";

/* STYLE */
import "./style.scss";

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
  const [{ block }, dispatch] = useStore();

  const handleDelete = () => {
    block.parentEditor.update(() => {
      const node = $getNodeByKey(block.nodeKey);
      if ($isBlockNode(node)) {
        node.remove();
        dispatch({
          action: "SET_BLOCK",
          payload: null,
        });
      }
    });
  };

  const [props, setProps] = useState(
    Object.assign({}, block ? block.props : {})
  );
  useEffect(() => {
    if (Object.keys(props).length === 0) return;
    debouncedSetter(props);
  }, [props]);

  useEffect(() => {
    if (!block) return;
    setProps(block.props);
    return () => setProps({});
  }, [block]);

  const delay = useRef();
  function debouncedSetter(props) {
    clearTimeout(delay.current);
    delay.current = setTimeout(() => {
      block.setProps({ ...block.props, ...props });
    }, 500);
  }

  // if (!block) return <h2>Select one block</h2>;
  return (
    <div className="block-controls">
      {block ? (
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
