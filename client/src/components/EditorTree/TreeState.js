import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getNode } from "utils/tree";

function build(tree, parent = null) {
  return tree.map((node) => {
    const treeNode = {
      key: node.key,
      active: node.active,
      parent,
    };
    treeNode.children = build(node.children, treeNode);
    return treeNode;
  });
}

function proxy(tree) {
  const listeners = [];

  const proxy = new Proxy(tree, {
    get(tree, key) {
      if (key === "listen") return (listener) => listeners.push(listener);
      const node = getNode(tree, (node) => node.key === key);
      return node?.active;
    },
    set(tree, key, value) {
      let node = getNode(tree, (node) => node.key === key);
      if (node && node.active !== value) {
        if (value) {
          while (node) {
            node.active = value;
            node = node.parent;
          }
        } else {
          let nodes = [node];
          while (nodes.length) {
            node = nodes.shift();
            node.active = value;
            nodes = nodes.concat(node.children);
          }
        }

        setTimeout(() => listeners.forEach((listener) => listener(tree)), 0);
      }
      return true;
    },
  });

  return proxy;
}

function merge(to, from) {
  if (!from) return to;
  to.forEach((node) => {
    const last = from.find((_node) => _node.key === node.key);
    if (last) {
      node.active = node.active !== void 0 ? node.active : last.active;
      merge(node.children, last.children);
    }
  });

  return to;
}

const Context = createContext([]);

export function useTreeState() {
  return useContext(Context);
}

function TreeState({ tree, children }) {
  const [state, setState] = useState();
  const [proxiedState, setProxiedState] = useState();

  const renewState = (tree) => {
    if (!tree) return;
    const newState = merge(build(tree), lastState.current);
    lastState.current = state;
    setState(newState);
  };

  const lastState = useRef([]);
  useEffect(() => {
    renewState(tree);
  }, [tree]);

  useEffect(() => {
    if (!state) return;
    setProxiedState(proxy(state));
  }, [state]);

  useEffect(() => {
    if (!proxiedState) return;
    proxiedState.listen(renewState);
  }, [proxiedState]);

  return (
    <Context.Provider value={[proxiedState, renewState]}>
      {children}
    </Context.Provider>
  );
}

export default TreeState;
