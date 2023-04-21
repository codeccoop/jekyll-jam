/* VENDOR */
import React, { useRef } from "react";
import { useStore } from "colmado";
import { $getNodeByKey } from "lexical";

/* SOURCE */
import { $isBlockNode } from "components/Editor/nodes/BlockNode";

function BlockControl({ name, value, setValue }) {
  const debounce = useRef();

  function handleOnChange({ target }) {
    clearTimeout(debounce.current);
    const value = target.value;
    debounce.current = setTimeout(() => setValue(value), 300);
  }

  return (
    <>
      <label htmlFor={name}>{name}</label>
      <input
        type="text"
        name={name}
        value={value || ""}
        onInput={handleOnChange}
      />
    </>
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

  if (!block) return <h2>Select one block</h2>;
  return (
    <div className="block-control">
      <form>
        {Object.entries(block.props).map((prop, i) => (
          <BlockControl
            key={`${prop[0]}-${i}`}
            name={prop[0]}
            value={prop[1]}
            setValue={(val) =>
              block.setProps({ ...block.props, [prop[0]]: val })
            }
          />
        ))}
      </form>
      <button onClick={handleDelete}>DELETE</button>
    </div>
  );
}

export default BlockControls;
