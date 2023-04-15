import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TRANSFORMERS, $convertFromMarkdownString } from "@lexical/markdown";
import { useEffect, useRef } from "react";
import { $getRoot } from "lexical";

function MarkdownInitialContentPlugin({ content, defaultContent }) {
  const [editor] = useLexicalComposerContext();

  const isInitialzed = useRef(false);
  useEffect(() => {
    if (!isInitialzed.current || (isInitialzed.current && content === defaultContent)) {
      editor.update(() => {
        $convertFromMarkdownString(content, TRANSFORMERS);
      });
    }

    return () => {
      isInitialzed.current = content !== defaultContent;
    };
  }, [content]);
  return null;
}

export default MarkdownInitialContentPlugin;
