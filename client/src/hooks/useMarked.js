import { useEffect } from "react";
import { useStore } from "colmado";
import { marked } from "marked";

import { genBlocksMarkedExtensions } from "../lib/blocks";

marked.setOptions({
  breaks: false,
  smartLists: true,
  smartypants: true,
});

function useMarked() {
  const [{ blocks }] = useStore();

  useEffect(() => {
    if (blocks.length) marked.use({ extensions: genBlocksMarkedExtensions(blocks) });
  }, [blocks]);

  return marked;
}

export default useMarked;
