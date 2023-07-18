export function localImage(md, options) {
  const defaultRender = md.renderer.rules.image;
  const filesRe = options.filesRe ?? /^files\/\d*\//;
  const filesPath = options.filesPath ?? '';

  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const aIndex = token.attrIndex('src');
    if (filesRe.test(token.attrs[aIndex][1])) {
      token.attrs[aIndex][1] = filesPath + token.attrs[aIndex][1];
    }
    return defaultRender(tokens, idx, options, env, self);
  };
}
