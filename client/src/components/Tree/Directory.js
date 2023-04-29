import React from "react";

function Directory({ path, name, sha, children, isOpen, open, addFile }) {
  return (
    <>
      <span
        className={"title" + (isOpen ? " open" : "")}
        id={sha}
        onClick={() => open(path)}
      >
        {name}
        <button className="create" onClick={(ev) => addFile(ev, path)}></button>
      </span>
      {children}
    </>
  );
}

export default Directory;
