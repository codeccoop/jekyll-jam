function commentWrap(meta, dom) {
  let node = dom.children[0];
  const openTag = new Comment(`\n[VOCERO-BLOCK]\n${meta}\n`);
  const closeTag = new Comment("[/VOCERO-BLOCK]");
  dom.insertBefore(openTag, node);
  dom.appendChild(closeTag);
  return dom;
}

function renderBlock(block, node) {
  const parser = document.createElement("template");
  const attributes = Object.fromEntries(
    Object.keys(node.attributes).map((idx) => {
      return [node.attributes[idx].name, node.attributes[idx].value];
    })
  );

  parser.innerHTML = block.fn(attributes);
  const dom = parser.content;

  return commentWrap(node.outerHTML, dom);
}

export function renderBlocks(html, blocks) {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");

  for (let block of blocks) {
    const nodes = doc.getElementsByTagName(block.name.toLowerCase());
    for (let i = 0; i < nodes.length; i++) {
      debugger;
      const node = nodes[i];
      const dom = renderBlock(block, node);
      for (let child of dom.childNodes) {
        node.parentElement.insertBefore(child, node);
        // node.insertAdjacentElement("beforebegin", content.children[0]);
      }
      node.parentElement.removeChild(node);
    }
  }

  return doc.body.innerHTML;
}
