import { $isBlockNode } from "nodes/BlockNode";

export function getTree(root, editor) {
  if ($isBlockNode(root)) return root.getTree(editor);

  if (!root.getChildren) {
    return Promise.resolve({
      type: root.getType(),
      key: root.getKey(),
      children: [],
      editor,
      isBlock: false,
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
          isBlock: false,
        })
    );
  });
}

export function getNode(tree, filter) {
  return tree.reduce((target, node) => {
    if (target) return target;
    if (filter(node)) return node;
    return getNode(node.children, filter);
  }, null);
}

export function getNodeByKey(tree, key) {
  return getNode(tree, (node) => node.key === key);
}

export function flattenTree(tree) {
  function gatherChildrens(node) {
    if (!node.children || node.children.length === 0) return [];
    return node.children.reduce((children, child) => {
      return children.concat(child, ...gatherChildrens(child));
    }, []);
  }

  return gatherChildrens(tree);
}
