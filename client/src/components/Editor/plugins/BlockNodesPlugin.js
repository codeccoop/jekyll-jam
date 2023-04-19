/* VENDOR */
import { useEffect } from "react";
import {
  createCommand,
  COMMAND_PRIORITY_LOW,
  COMMAND_PRIORITY_EDITOR,
  KEY_ARROW_DOWN_COMMAND,
  $getSelection,
  $getRoot,
  $insertNodes,
  $isTextNode,
  $isRootNode,
  $getNearestRootOrShadowRoot,
  COMMAND_PRIORITY_HIGH,
  $getNodeByKey,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext.js";
import { useStore } from "colmado";
import { mergeRegister } from "@lexical/utils";

/* SOURCE */
import BlockNode, { $createBlockNode, $isBlockNode } from "../nodes/BlockNode.js";
import { uuid } from "lib/helpers";

export const INSERT_BLOCK_NODE = createCommand();
export const INSERT_NESTED_BLOCK_NODE = createCommand();

function isFamily(hierarchy, ancestors) {
  return (
    hierarchy.filter((ID) => ancestors.find((ancestor) => ancestor === ID)).length ==
    ancestors.length
  );
}

function BlockNodesPlugin({ hierarchy = [] }) {
  const [{ editor: editorContext }] = useStore();

  let editor;
  if (hierarchy.length) {
    const parentId = hierarchy[hierarchy.length - 1];
    editor = editorContext.blocks[parentId]?.editor;
  } else {
    [editor] = useLexicalComposerContext();
  }

  function insertBlock(defn, ancestors) {
    editor.update(() => {
      const selection = $getSelection();
      if (selection) {
        const blockNode = $createBlockNode({
          defn,
          ID: uuid(),
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
    if (!editor) return;

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
            if (!anchor) return;
            const root = $isRootNode(anchor)
              ? anchor
              : $getNearestRootOrShadowRoot(anchor);
            if (!$isBlockNode(root)) return;
          });
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        INSERT_BLOCK_NODE,
        ({ defn }) => {
          if (hierarchy.length) return false;
          insertBlock(defn, []);
          return false;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(
        INSERT_NESTED_BLOCK_NODE,
        ({ defn, ancestors }) => {
          if (!hierarchy.length) return false;
          if (!isFamily(hierarchy, ancestors)) return;
          insertBlock(defn, ancestors);
          return false;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [editor]);

  return null;
}

export default BlockNodesPlugin;
