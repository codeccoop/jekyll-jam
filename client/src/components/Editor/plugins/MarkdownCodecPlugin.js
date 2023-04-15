import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { TRANSFORMERS, $convertToMarkdownString } from "@lexical/markdown";

function MarkdownCodecPlugin({ onUpdate }) {
  const [editor] = useLexicalComposerContext();

  editor.registerUpdateListener(({ editorState }) => {
    editorState.read(() => {
      onUpdate($convertToMarkdownString(TRANSFORMERS));
    });
  });
}

export default MarkdownCodecPlugin;
