/* VENDOR */
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  createCommand,
  COMMAND_PRIORITY_EDITOR,
  KEY_ARROW_DOWN_COMMAND,
  $getSelection,
  $getRoot,
  $insertNodes,
  $isTextNode,
  $isRootNode,
  $getNearestRootOrShadowRoot,
} from "lexical";
import { mergeRegister } from "@lexical/utils";

/* SOURCE */
import BlockNode, { $createBlockNode, $isBlockNode } from "../nodes/BlockNode";
import useMarked from "../../../hooks/useMarked";

export const INSERT_BLOCK_NODE = createCommand();
export const INSERT_NESTED_BLOCK_NODE = createCommand();

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
}

function isFamily(hierarchy, ancestors) {
  return (
    hierarchy.filter((id) => ancestors.find((ancestor) => ancestor === id)).length > 0
  );
}

function BlockNodesPlugin({ hierarchy = [], descendants = [] }) {
  const [editor] = useLexicalComposerContext();
  console.log(editor);
  const marked = useMarked();

  function insertBlock(defn, ancestors) {
    editor.update(() => {
      const selection = $getSelection();
      if (selection) {
        const blockNode = $createBlockNode({
          defn,
          ID: uuidv4(),
          ancestors: ancestors,
        });
        let anchor = selection.anchor.getNode();

        if ($isTextNode(anchor)) {
          anchor = anchor.getParent();
        }

        if ($isRootNode(anchor)) {
          anchor.append(blockNode);
        } else if (anchor.isEmpty()) {
          anchor.replace(blockNode);
        } else {
          const parent = anchor.getParent();
          parent.append(blockNode);
        }
        blockNode.focus();
      } else {
        const root = $getRoot();
        root.getChildren().forEach((node) => {
          try {
            if ($isBlockNode(node)) {
              node.editor.dispatchCommand(INSERT_NESTED_BLOCK_NODE, {
                defn,
                ancestors: node.ancestors.concat(node.ID),
              });
            }
          } catch (e) {
            console.warn(e);
          }
        });
      }
    });
  }

  useEffect(() => {
    if (!editor.hasNodes([BlockNode])) {
      throw new Error(
        "VoceroBlocks: BlockNode is not registered on editor (initialConfig.nodes)"
      );
    }
    return mergeRegister(
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        () => {
          editor.getEditorState().read(() => {
            const selection = $getSelection();
            const anchor = selection.anchor.getNode();
            const root = $getNearestRootOrShadowRoot(anchor);
            console.log(root);
            if (!$isBlockNode(root)) return;

            console.log(root);
          });
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(
        INSERT_BLOCK_NODE,
        ({ defn }) => {
          if (hierarchy.length) return;
          insertBlock(defn, []);
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(
        INSERT_NESTED_BLOCK_NODE,
        ({ defn, ancestors }) => {
          if (!hierarchy.length) return;
          if (!isFamily(hierarchy, ancestors)) retrun;
          insertBlock(defn, ancestors);
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [editor]);

  return null;
}

export default BlockNodesPlugin;
