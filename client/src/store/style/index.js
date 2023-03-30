import React, { useState } from "react";

import reducer from "./reducer";

const Component = ({ store, Warehouse, children }) => {
  const [css, setCss] = useState();

  async function storeCss(req) {
    try {
      const css = await req;
      setCss(css);
    } catch (err) {
      console.error("Can't load css");
    }
  }

  return <Warehouse value={[css, storeCss]}>{children}</Warehouse>;
};

export default { name: "style", Component, reducer };
