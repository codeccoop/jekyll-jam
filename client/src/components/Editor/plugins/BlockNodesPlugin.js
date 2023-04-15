/* VENDOR */
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  createCommand,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  KEY_ENTER_COMMAND,
  DELETE_CHARACTER_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createTextNode,
  $createParagraphNode,
  $getRoot,
} from "lexical";
import {
  $shouldInsertTextAfterOrBeforeTextNode,
  mergeRegister,
  $insertNodeToNearestRoot,
} from "@lexical/utils";

/* SOURCE */
import BlockNode, { $createBlockNode, $isBlockNode } from "../nodes/BlockNode";
import BlockContentNode, {
  $createBlockContentNode,
  $isBlockContentNode,
} from "../nodes/BlockContentNode";
import BlockTokenNode, {
  $createBlockTokenNode,
  $isBlockTokenNode,
} from "../nodes/BlockTokenNode";
import useMarked from "../../../hooks/useMarked";

export const INSERT_BLOCK_NODE = createCommand();

function onBlockTokenTransform(node) {
  const parent = node.getParent();
  const siblings = parent.getChildren();

  if (!$isBlockNode(parent)) {
    node.remove();
  } else if (node.token.trim() !== node.getTextContent().trim()) {
    // siblings.forEach((sibling) => {
    //   if ($isBlockTokenNode(sibling)) {
    //     sibling.remove();
    //   }
    // });
  }
}

function onBlockContentTransform(node) {
  const parent = node.getParent();

  if (!$isBlockNode(parent)) {
    const children = node.getChildren();
    for (const child of children) {
      node.insertAfter(child);
    }
    node.remove();
  }
}

function onBlockTransform(node) {
  const children = node.getChildren();

  if (children.length === 0) {
    node.replace($createParagraphNode());
  } else if (children.filter((child) => $isBlockTokenNode(child)).length < 2) {
    children.forEach((child) => {
      if ($isBlockContentNode(child))
        child.getChildren().forEach((child) => child.remove());
      child.remove();
    });
  }
}

function BlockNodesPlugin() {
  const [editor] = useLexicalComposerContext();
  const marked = useMarked();

  useEffect(() => {
    if (!editor.hasNodes([BlockNode, BlockContentNode, BlockTokenNode])) {
      throw new Error(
        "VoceroBlocks: BlockNode is not registered on editor (initialConfig.nodes)"
      );
    }
    return mergeRegister(
      // editor.registerNodeTransform(BlockContentNode, onBlockContentTransform),
      // editor.registerNodeTransform(BlockTokenNode, onBlockTokenTransform),
      editor.registerNodeTransform(BlockNode, onBlockTransform),
      editor.registerCommand(
        INSERT_BLOCK_NODE,
        (defn) => {
          editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;
            const isLastChild = selection.getNodes().pop().isLastChild();

            const blockNode = $createBlockNode(defn, marked);

            let nodeToFocus;
            if (defn.selfClosed) {
              const tokenNode = $createBlockTokenNode(defn, 2);
              tokenNode.append($createTextNode(tokenNode.token));
              blockNode.append(tokenNode);
              nodeToFocus = tokenNode;
            } else {
              const openTokenNode = $createBlockTokenNode(defn, 0);
              // openTokenNode.append($createTextNode(openTokenNode.token));
              const blockContentNode = $createBlockContentNode();
              // blockContentNode.append($createParagraphNode());
              const closeTokenNode = $createBlockTokenNode(defn, 1);
              // closeTokenNode.append($createTextNode(closeTokenNode.token));
              blockNode.append(openTokenNode, blockContentNode, closeTokenNode);
              nodeToFocus = blockContentNode;
            }

            const toAppend = [blockNode];
            if (isLastChild) {
              toAppend.push($createParagraphNode());
            }
            selection.insertNodes(toAppend);
            nodeToFocus.selectStart();
            // $insertNodeToNearestRoot(blockNode);
          });

          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      // editor.registerCommand(
      //   DELETE_CHARACTER_COMMAND,
      //   () => {
      //     const selection = $getSelection();
      //     if (!$isRangeSelection(selection)) return;
      //     const anchorNode = selection.anchor.getNode();
      //     if ($isBlockTokenNode(anchorNode)) {
      //       anchorNode.remove();
      //       return true;
      //     }
      //     return false;
      //   },
      //   COMMAND_PRIORITY_LOW
      // ),
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (ev) => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;

          const anchorNode = selection.anchor.getNode();
          if ($isBlockTokenNode(anchorNode)) {
            const p = $createParagraphNode();
            if (anchorNode.position === 0) {
              $insertNodeToNearestRoot(p);
            } else {
              const parent = anchorNode.getParent();
              if (parent.isLastChild()) {
                const root = $getRoot();
                root.append(p);
              } else {
                $shouldInsertTextAfterOrBeforeTextNode(selection, p);
              }
            }

            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  return null;
}

export default BlockNodesPlugin;
