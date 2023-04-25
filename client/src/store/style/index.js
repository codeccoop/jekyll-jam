/* VENDOR */
import React, { useEffect, useState } from "react";

/* SOURCE */
import reducer from "./reducer";
import { b64d } from "lib/helpers";

const API_URL = process.env.VOCERO_API_URL;

const Component = ({ store, Warehouse, children }) => {
  const [blob, setBlob] = useState();
  const [css, setCss] = useState();

  useEffect(() => {
    if (!blob) return;

    const path = API_URL + "/" + b64d(blob.path).replace(/\.scss$/, ".css");
    fetch(path, {
      Accept: "text/css",
    })
      .then((res) => res.text())
      .then((css) => setCss(css));
  }, [blob]);

  return <Warehouse value={[css, setBlob]}>{children}</Warehouse>;
};

export default { name: "style", Component, reducer };
