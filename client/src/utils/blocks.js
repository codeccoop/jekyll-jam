export function renderBlock(block, node) {
  const attributes = Object.fromEntries(
    Object.keys(node.attributes).map((idx) => {
      return [node.attributes[idx].name, node.attributes[idx].value];
    })
  );
  return block.fn(attributes);
}

export function renderBlocks(html, blocks) {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  const parser = document.createElement("template");

  for (let block of blocks) {
    const nodes = doc.getElementsByTagName(block.name.toLowerCase());
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      parser.innerHTML = renderBlock(block, node);
      node.insertAdjacentElement("beforebegin", parser.content.children[0]);
      node.parentElement.removeChild(node);
    }
  }

  return doc.body.innerHTML;
}
