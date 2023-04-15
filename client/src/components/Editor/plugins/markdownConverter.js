import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import {
  TRANSFORMERS,
  $convertToMarkdownString,
  $convertFromMarkdownString,
} from "@lexical/markdown";
import { useEffect } from "react";

function MarkdownCodecPlugin({ onUpdate }) {
  const [editor] = useLexicalComposerContext();

  // editor.registerUpdateListener(({ editorState }) => {
  //   editorState.read(() => {
  //     onUpdate($convertToMarkdownString(TRANSFORMERS));
  //   });
  // });

  editor.registerTextContentListener((textContent) => {
    console.log(textContent);
  });

  return null;
}

export default MarkdownCodecPlugin;
