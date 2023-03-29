function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
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

function commentWrap(fragment, raw, uuid) {
  let node = fragment.children[0];
  const openTag = new Comment(` vocero-block="${uuid}" ${btoa(raw.trim())} `);
  const closeTag = new Comment(` /vocero-block="${uuid}" `);
  fragment.insertBefore(openTag, node);
  fragment.appendChild(closeTag, node);
  return fragment;
}

function renderBlock(blockDefn, node) {
  const attributes = getNodeAttributes(node);
  return parseHTMLFragment(blockDefn.fn({ ...attributes, content: node.innerHTML }));
}

export function renderBlocks(src, marked) {
  if (!src) return "";

  let rendered = "";
  const tokens = marked.Lexer.lex(src, marked.defaults);

  tokens.forEach((token) => {
    if (token.renderer) {
      const block = token.renderer.call({ parser: marked.Parser }, token, true);
      rendered +=
        token.raw.match(/^(\n|\r)*/)[0] + block + token.raw.match(/(\n|\r)*$/)[0];
    } else {
      rendered += token.raw;
    }
  });

  return rendered;
}

export function hydrateBlocks(md) {
  if (!md) return "";

  while (/<!-- vocero-block/g.test(md)) {
    const uuid = md.match(/(?<=<!-- vocero-block=")([^"]+)" /)[1];
    const block = atob(
      md.match(new RegExp(`(?<=<!-- vocero-block="${uuid}" )(.(?!-->))*(?= -->)`))[0]
    );
    md = md.replace(
      new RegExp(
        `\n\n<!-- vocero-block="${uuid}" (\n|\r|.)+/vocero-block="${uuid}" -->\n\n`
      ),
      block
    );
  }

  return md.replace(/\n\n+/, "\n\n");
}

export function genBlocksMarkedExtensions(blocks) {
  const renderers = blocks.map((blockDefn) => {
    const openPattern = `(\n|\r|\\s)*<(${blockDefn.name}(\n|\r|\\s)+[^>]*|${blockDefn.name}(?=>))>`;
    const contentPattern = `(((\n|\r|.)(?!/${blockDefn.name}>))*)`;
    const closePattern = `<\/${blockDefn.name}>(\n|\r|\\s)*`;

    function renderer(token, meta = false) {
      if (meta) meta = JSON.parse(JSON.stringify(token));

      if (token.tokens.length) {
        const content = token.tokens.reduce((html, token) => {
          return (
            html +
            (token.renderer
              ? token.renderer.call(this, token)
              : this.parser.parse([token]))
          );
        }, "");
        token.raw = token.raw.replace(token.content, content);
      }
      const node = parseHTMLFragment(token.raw).children[0];
      let fragment = renderBlock(blockDefn, node);
      if (meta) fragment = commentWrap(fragment, meta.raw, meta.uuid);
      let html = "";
      for (let node of fragment.childNodes) {
        switch (node.nodeType) {
          case fragment.COMMENT_NODE:
            html += "\n\n<!--" + node.data + "-->\n\n";
            break;
          case fragment.ELEMENT_NODE:
            html += node.outerHTML + "\n";
            break;
        }
      }

      return html;
    }

    function isBalanced(src) {
      const openRule = new RegExp(openPattern, "g");
      const closeRule = new RegExp(closePattern, "g");

      return (
        Array.from(src.matchAll(openRule)).length ===
        Array.from(src.matchAll(closeRule)).length
      );
    }

    function getTokenContent(match) {
      const src = match.input;
      let raw = match[0];
      let content = match[4];
      let [open, close] = raw.split(content);

      while (!isBalanced(raw)) {
        const match = src
          .replace(raw, "")
          .match(new RegExp(`${contentPattern}${closePattern}`));
        raw += match[0];
        content += `${close}${match[1]}`;
        [open, close] = raw.split(content);
      }
      return [raw, content.trim()];
    }

    return {
      name: blockDefn.name,
      level: blockDefn.level,
      start(src) {
        const rule = new RegExp(openPattern);
        return src.match(rule)?.index;
      },
      tokenizer(src) {
        const rule = new RegExp(`^${openPattern}${contentPattern}${closePattern}`);
        const match = rule.exec(src);

        if (match) {
          const [raw, content] = getTokenContent(match);

          const token = {
            raw,
            content,
            renderer,
            type: blockDefn.name,
            tokens: [],
            uuid: uuidv4(),
          };

          token.content && this.lexer.blockTokens(token.content, token.tokens);

          return token;
        }
      },
      renderer,
    };
  });

  return renderers;
}
