function parseHTMLDoc(html) {
  return new DOMParser().parseFromString(html, "text/html");
}

function parseHTMLFragment(html) {
  const renderer = document.createElement("template");
  renderer.innerHTML = html;
  return renderer.content;
}

function getNodeAttributes(node) {
  return Object.fromEntries(
    Object.keys(node.attributes).map((idx) => {
      return [node.attributes[idx].name, node.attributes[idx].value];
    })
  );
}

function htmlToBml(blockDefn, html) {
  const nameReg = new RegExp(blockDefn.name, "ig");
  let capitalized = html.replace(nameReg, blockDefn.name);
  const node = parseHTMLFragment(html).children[0];
  const attrs = getNodeAttributes(node);
  Object.entries(attrs).forEach((attr, index, entries) => {
    const attrString = `${attr[0]}="${attr[1]}"`;
    capitalized = capitalized.replace(attrString, "\n  " + attrString);
    if (index === entries.length - 1) {
      capitalized = capitalized.replace(attrString, attrString + "\n");
    }
  });
  return capitalized;
}

function commentWrap(blockDefn, html, fragment) {
  let node = fragment.children[0];
  const openTag = new Comment(` vocero-block\n${htmlToBml(blockDefn, html)}\n`);
  const closeTag = new Comment(" /vocero-block ");
  fragment.insertBefore(openTag, node);
  fragment.appendChild(closeTag, node);
  return fragment;
}

function renderBlock(blockDefn, node) {
  const attributes = getNodeAttributes(node);
  const fragment = parseHTMLFragment(blockDefn.fn(attributes));
  return commentWrap(blockDefn, node.outerHTML, fragment);
}

export function renderBlocks(html, blocks) {
  if (!html) return "";

  const doc = parseHTMLDoc(html);

  for (let blockDefn of blocks) {
    const nodes = doc.getElementsByTagName(blockDefn.name.toLowerCase());
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const dom = renderBlock(blockDefn, node);

      while (dom.childNodes.length) {
        const child = dom.childNodes[i];
        node.parentElement.insertBefore(child, node);
      }
      node.parentElement.removeChild(node);
    }
  }

  return doc.body.innerHTML;
}

export function undoBlockRenders(md) {
  if (!md) return "";

  while (md.match(/<!-- vocero-block/g)) {
    const block = md.match(/(?<=<!-- vocero-block\n)(\n|.)*(?=\n-->)/);
    md = md.replace(/<!-- vocero-block(\n|.)*\/vocero-block -->/, block[0]);
  }

  return md;
}

export function genBMLMakredExtension(blocks) {
  return blocks.map((blockDefn) => {
    return {
      name: blockDefn.name,
      level: "block",
      start(src) {
        return src.match(new RegExp(`<${blockDefn.name}[^>]+>`))?.index;
      },
      tokenizer(src, tokens) {
        const rule = new RegExp(
          `^<${blockDefn.name}[^>]+>(((\n|.)(?!/${blockDefn.name}))*)</${blockDefn.name}>`
        );
        const match = rule.exec(src);
        if (match) {
          return {
            type: blockDefn.name,
            raw: match[0],
            content: match[3],
          };
        }
      },
      renderer(token) {
        const node = parseHTMLFragment(token.raw).children[0];
        const fragment = renderBlock(blockDefn, node, this.parseInline);
        let html = "";
        for (let node of fragment.childNodes) {
          switch (node.nodeType) {
            case fragment.COMMENT_NODE:
              html += "<!--" + node.data + "-->\n";
              break;
            case fragment.ELEMENT_NODE:
              html += node.outerHTML + "\n";
              break;
          }
        }

        return `\n<div class="vocero-block">\n
          ${html}\n
        </div>`;
      },
    };
  });
}
