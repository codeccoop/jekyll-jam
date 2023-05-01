/* VENDOR */
import React, { useEffect, useState } from "react";

/* SOURCE */
import reducer from "./reducer";
import { b64d } from "lib/helpers";

const BASE_URL = process.env.VOCERO_BASE_URL.replace(/\/+$/, "");
const API_URL = process.env.VOCERO_API_URL;

const Component = ({ Warehouse, children }) => {
  const [blob, setBlob] = useState();
  const [css, setCss] = useState();

  useEffect(() => {
    if (!blob) return;

    const path = `${BASE_URL}${API_URL}/${b64d(blob.path).replace(
      /\.scss$/,
      ".css"
    )}`;
    fetch(path, {
      Accept: "text/css",
    })
      .then((res) => res.text())
      .then((css) => setCss(css));
  }, [blob]);

  return <Warehouse value={[css, setBlob]}>{children}</Warehouse>;
};

export default { name: "style", Component, reducer };
