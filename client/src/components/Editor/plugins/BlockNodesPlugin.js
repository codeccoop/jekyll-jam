/* VENDOR */
import { useEffect } from "react";
import {
  createCommand,
  // COMMAND_PRIORITY_LOW,
  COMMAND_PRIORITY_EDITOR,
  // KEY_ARROW_DOWN_COMMAND,
  $getSelection,
  $getRoot,
  // $insertNodes,
  $isTextNode,
  $isRootNode,
  $getNodeByKey,
  // $getNearestRootOrShadowRoot,
  // COMMAND_PRIORITY_HIGH,
  // $getNodeByKey,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext.js";
import { mergeRegister } from "@lexical/utils";
import { useStore } from "colmado";

/* SOURCE */
import BlockNode, {
  $createBlockNode,
  $isBlockNode,
} from "../nodes/BlockNode.js";
import { useBlockRegistryContext } from "lib/contexts/BlockRegistry";

export const INSERT_BLOCK_NODE = createCommand();
export const INSERT_NESTED_BLOCK_NODE = createCommand();

/* function isParent(hierarchy, ancestors) {
  return hierarchy[hierarchy.length - 1] === ancestors[ancestors.length - 1];
} */

function isFamily(hierarchy, ancestors) {
  return (
    hierarchy.filter((nodeKey) =>
      ancestors.find((ancestor) => ancestor === nodeKey)
    ).length == ancestors.length
  );
}

function BlockNodesPlugin({ parentEditor, hierarchy = [] }) {
  const nodeKey = hierarchy[hierarchy.length - 1];
  const blocksRegistry = useBlockRegistryContext();
  const [, dispatch] = useStore();

  let editor;
  if (hierarchy.length) {
    editor = blocksRegistry[nodeKey]?.editor;
  } else {
    [editor] = useLexicalComposerContext();
  }

  function insertBlock(defn, ancestors) {
    editor.update(() => {
      const selection = $getSelection();
      if (selection) {
        const blockNode = $createBlockNode({ defn, ancestors });
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
          if ($isBlockNode(node)) {
            node.editor.dispatchCommand(INSERT_NESTED_BLOCK_NODE, {
              defn,
              ancestors: node.ancestors.concat(node.getKey()),
            });
          }
        });
      }
    });
  }

  /* function withPropagation(command, callback) {
    function _callback(payload) {
      try {
        callback(payload);
      } catch (e) {
        editor.getEditorState().read(() => {
          const root = $getRoot();
          root.getChildren().forEach((node) => {
            if ($isBlockNode(node)) {
              const ancestors = payload.ancestors || [];
              if (!isFamily(hierarchy, ancestors)) return false;
              node.editor.dispatchCommand(command, {
                ...payload,
                ancestors: ancestors.concat(node.getKey()),
              });
            }
          });
        });
      }

      return true;
    }

    return [command, _callback];
  } */

  function blurBlocks() {
    dispatch({
      action: "SET_BLOCK",
      payload: null,
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
      /* editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        (payload) => {
          editor.getEditorState().read(() => {
            const ancestors = payload.ancestors || [];
            const root = $getRoot();
            root.getChildren().forEach((node) => {
              if (!$isBlockNode(node)) return;
              if (isFamily(hierarchy, ancestors)) {
              } else {
                node.editor.dispatchCommand(KEY_ARROW_DOWN_COMMAND, {
                  ancestors: ancestors.concat(node.getKey()),
                });
              }
            });
          });
          return true;
          if (ev.currentTarget.__lexicalEditor.getKey() === editor.getKey()) {
            editor.update(() => {
              // const selection = $getSelection();
              // if (!selection) return;
              // const anchor = selection.anchor.getNode();
              // if (!anchor) return;
              // const root = $isRootNode(anchor)
              //   ? anchor
              //   : $getNearestRootOrShadowRoot(anchor);
              debugger;
              const root = $getRoot();
              if (!$isBlockNode(root)) return false;
              console.log("Append paragraph");
            });
          } else {
            editor.getEditorState().read(() => {
              const root = $getRoot();
              root.getChildren().forEach((node) => {
                if ($isBlockNode(node)) {
                  node.editor.dispatchCommand(KEY_ARROW_DOWN_COMMAND, ev);
                }
              });
            });
          }
          return true;
        },
        COMMAND_PRIORITY_LOW
      ), */
      editor.registerRootListener((el) => {
        if (!parentEditor) {
          el.removeEventListener("focus", blurBlocks);
          el.addEventListener("focus", blurBlocks);
        }
        return true;
      }),
      editor.registerCommand(
        INSERT_BLOCK_NODE,
        ({ defn }) => {
          if (!hierarchy.length) {
            insertBlock(defn, []);
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(
        INSERT_NESTED_BLOCK_NODE,
        ({ defn, ancestors }) => {
          if (hierarchy.length && isFamily(hierarchy, ancestors)) {
            insertBlock(defn, ancestors);
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [editor]);

  return null;
}

export default BlockNodesPlugin;
