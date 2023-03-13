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
  return html.replace(nameReg, blockDefn.name);
}

function commentWrap(blockDefn, html, fragment) {
  let node = fragment.children[0];
  const openTag = new Comment(
    ` vocero-block="${blockDefn.name}"\n${htmlToBml(blockDefn, html, false)}\n`
  );
  const closeTag = new Comment(` /vocero-block="${blockDefn.name}" `);
  fragment.insertBefore(openTag, node);
  fragment.appendChild(closeTag, node);
  return fragment;
}

function renderBlock(blockDefn, node) {
  const attributes = getNodeAttributes(node);
  return parseHTMLFragment(blockDefn.fn(attributes));
}

export function renderBlocksToStore(src, blocks) {
  if (!src) return "";

  const renderers = genBMLMakredExtension(blocks);

  let rendered = "";
  while (/\n/.test(src)) {
    renderers.forEach((renderer, i) => {
      const token = renderer.tokenizer(src);
      if (token) {
        const block = renderer.renderer(token, true);
        src = src.replace(token.raw, "");
        rendered += block;
      } else {
        const rule = /^\n*[^\n]*\n+/;
        const line = src.match(rule)[0];
        src = src.replace(rule, "");
        rendered += line;
      }
    });
  }

  return rendered;
}

export function undoBlockRenders(md) {
  if (!md) return "";

  while (md.match(/<!-- vocero-block/g)) {
    const name = md.match(/(?<=<!-- vocero-block=")([^"]+)"\n/)[1];
    const block = md.match(
      new RegExp(`(?<=<!-- vocero-block="${name}"\n)(\n|.)*(?=\n-->)`)
    )[0];
    md = md.replace(
      new RegExp(`<!-- vocero-block="${name}"\n(\n|.)+/vocero-block="${name}" -->`),
      block
    );
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
      renderer(token, meta = false) {
        const node = parseHTMLFragment(token.raw).children[0];
        let fragment = renderBlock(blockDefn, node);
        if (meta) fragment = commentWrap(blockDefn, token.raw, fragment);
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

        return html;
      },
    };
  });
}
