/* VENDOR */
import React, { useStore } from "colmado";

/* SOURCE */

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

function BlockControls() {
  const [{ editor }] = useStore();

  const handleDelete = () => {
    editor._parentEditor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isBlockNode(node)) {
        node.remove();
      }
    });
  };

  return (
    <div className="block-control">
      <form>
        {editor.block &&
          Object.entries(editor.block.props).map((prop, i) => (
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

export default BlockControls;
