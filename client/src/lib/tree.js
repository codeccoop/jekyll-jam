import { $isBlockNode } from "components/Editor/nodes/BlockNode";

export function getTree(root, editor) {
  if ($isBlockNode(root)) return root.getTree(editor);

  if (!root.getChildren) {
    return Promise.resolve({
      type: root.getType(),
      key: root.getKey(),
      children: [],
      editor,
    });
  }

  return new Promise((res) => {
    Promise.all(root.getChildren().map((node) => getTree(node))).then(
      (children) =>
        res({
          key: root.getKey(),
          type: root.getType(),
          children,
          editor,
        })
    );
  });
}

export function getNode(tree, key) {
  return tree.reduce((target, node) => {
    if (target) return target;
    if (node.key === key) return node;
    return getNode(node.children, key);
  }, null);
}
