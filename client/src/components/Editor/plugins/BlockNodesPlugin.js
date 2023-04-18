/* VENDOR */
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
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
} from "lexical";
import { mergeRegister } from "@lexical/utils";
import { useStore } from "colmado";

/* SOURCE */
import BlockNode, { $createBlockNode, $isBlockNode } from "../nodes/BlockNode";
// import useMarked from "hooks/useMarked";
import { uuid } from "lib/helpers";

export const INSERT_BLOCK_NODE = createCommand();
export const INSERT_NESTED_BLOCK_NODE = createCommand();

function isFamily(hierarchy, ancestors) {
  return (
    hierarchy.filter((id) => ancestors.find((ancestor) => ancestor === id)).length > 0
  );
}

function BlockNodesPlugin({ hierarchy = [], descendants = [] }) {
  const [editor] = useLexicalComposerContext();
  const [{ editor: editorContext }] = useStore();
  // const marked = useMarked();

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
    if (!editor.hasNodes([BlockNode])) {
      throw new Error(
        "VoceroBlocks: BlockNode is not registered on editor (initialConfig.nodes)"
      );
    }
    return mergeRegister(
      // editor.registerUpdateListener(({ editorState }) => {
      //   console.log(editorState.toJSON());
      // }),
      editor.registerDecoratorListener((decorators) => {
        Object.keys(decorators).forEach((key) => {
          const decorator = decorators[key];
          console.log(editorContext.blocks);
          // console.log(decorator.props);
        });
      }),
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
