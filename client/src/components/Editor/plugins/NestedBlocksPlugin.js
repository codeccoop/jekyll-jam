/* VENDOR */
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

/* SOURCE */
import useMarked from "../../../hooks/useMarked";

function NestedBlocksPlugin({ descendants = [] }) {
  const [editor] = useLexicalComposerContext();
  const marked = useMarked();

  // useEffect(() => {
  //   return editor.registerUpdateListener(({ editorState }) => {
  //     editorState.read(() => {
  //       editorState.getDecorators().forEach((decorator) => {
  //         console.log(decorator);
  //       });
  //     });
  //   });
  // });
  return null;
}

export default NestedBlocksPlugin;
