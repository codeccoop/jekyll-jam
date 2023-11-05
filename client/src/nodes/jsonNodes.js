export function EmptyState() {
  return {
    root: {
      children: [ParagraphNode()],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

export function TextNode() {
  return {
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
    text: "",
    type: "text",
    version: 1,
  };
}

export function ParagraphNode() {
  return {
    children: [TextNode()],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "paragraph",
    version: 1,
  };
}

export function RootNode() {
  return {
    version: 1,
    type: "block",
    defn: {
      family: "root",
      name: "Content",
      level: "block",
      args: [],
      selfClosed: false,
    },
    editorState: EmptyState(),
    ancestors: [],
    props: {},
  };
}
