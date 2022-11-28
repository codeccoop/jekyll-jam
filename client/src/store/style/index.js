import React, { useEffect, useMemo, useState } from "react";

import reducer from "./reducer";
import { getStyleURL } from "../../services/api";

const Component = ({ store, Warehouse, children }) => {
  const [css, storeCss] = useState();
  const [branch, setBranch] = store.branch;

  const currentBranch = useMemo(() => branch.sha, [branch.sha]);

  useEffect(() => {
    if (!currentBranch) return;
    getStyleURL(currentBranch).then((data) => {
      fetch(atob(data.url), {
        headers: {
          "Accept": "text/css",
        },
      })
        .then((res) => res.text())
        .then((data) => {
          storeCss(data);
        });
    });
  }, [currentBranch]);

  return <Warehouse value={[css, setBranch]}>{children}</Warehouse>;
};

export default { name: "style", Component, reducer };
