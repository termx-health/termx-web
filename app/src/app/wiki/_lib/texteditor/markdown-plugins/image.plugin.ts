import {environment} from 'environments/environment';
import {tokenAttrValue} from 'term-web/wiki/_lib/texteditor/markdown-plugins/plugin.util';

// matches "files/:pageId/:fileName"
const filesRe = /^files\/(\d*)\/(.+)/;

const filesLink = (url: string) => {
  const [_, id, name] = url.match(filesRe);
  return `${environment.termxApi}/pages/static/${id}/files/${name}`;
};


export function localImage(md): void {
  const defaultRender = md.renderer.rules.image;

  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    const [val, setVal] = tokenAttrValue(tokens[idx], 'src');
    if (filesRe.test(val)) {
      setVal(filesLink(val));
    }
    return defaultRender(tokens, idx, options, env, self);
  };
}
