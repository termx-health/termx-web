export function sourceLinePlugin(md): void {
  const temp = md.renderer.renderToken.bind(md.renderer);
  md.renderer.renderToken = (tokens, idx, options) => {
    let token = tokens[idx];
    if (token.level === 0 && token.map !== null) {
      token.attrPush(['data-source-line', token.map[0] + 1]);
    }
    return temp(tokens, idx, options);
  };
}
