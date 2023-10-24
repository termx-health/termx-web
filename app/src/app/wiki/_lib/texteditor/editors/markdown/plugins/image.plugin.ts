import {environment} from 'environments/environment';
import {tokenAttrValue} from './plugin.util';

// matches "files/:pageId/:fileName"
const filesRe = /^files\/(\d*)\/(.+)/;

const filesLink = (url: string) => {
  const [_, id, name] = url.match(filesRe);
  return `${environment.termxApi}/pages/${id}/files/${name}`;
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
