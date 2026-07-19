import {filesLink, filesRe, tokenAttrValue} from 'term-web/wiki/_lib/texteditor/editors/markdown/plugins/plugin.util';


export function localImage(md, mdOptions?: {token?: string}): void {
  const defaultRender = md.renderer.rules.image;

  md.renderer.rules.image = function (tokens, idx, options, env, self): string {
    const [val, setVal] = tokenAttrValue(tokens[idx], 'src');
    if (filesRe.test(val)) {
      setVal(filesLink(val, mdOptions?.token));
    }
    return defaultRender(tokens, idx, options, env, self);
  };
}
