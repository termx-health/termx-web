import {parsePageRelationLink} from '../../page/utils/page-relation.utils';
import {tokenAttrValue} from './plugin.util';

const transformHref = (href: string, ctx: {spaceId?: number}): string => {
  const [system, value] = href.split(':');

  switch (system) {
    case 'cs':
      return `/resources/code-systems/${value}/summary`;
    case 'vs':
      return `/resources/value-sets/${value}/summary`;
    case 'ms':
      return `/resources/map-sets/${value}/view`;
    case 'concept':
      const [cs, concept] = value.split('|');
      return cs === 'snomed-ct'
        ? `/integration/snomed/dashboard/${concept}`
        : `/resources/code-systems/${cs}/concepts/${concept}/view`;
    case 'page':
      const {page, space} = parsePageRelationLink(value);
      if (space) {
        return `/wiki/${space}/${page}`;
      }
      return ctx.spaceId ? `/wiki/${ctx.spaceId}/${value}` : `/wiki/${value}`;
    default:
      return href;
  }
};

const processHref = (href: string, ctx: {spaceId?: number}): string => {
  if (["cs", "vs", "ms", "concept", "page"].includes(href.split(":")[0])) {
    // decorates link with missing parts
    return transformHref(decodeURIComponent(href), ctx);
  }
  return href;
};

const defaultRenderer = (tokens, idx, options, env, self) => {
  return self.renderToken(tokens, idx, options);
};


export function localLink(md, mdOptions): void {
  const renderer = md.renderer.rules.link_open || defaultRenderer;

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const [val, setVal] = tokenAttrValue(tokens[idx], 'href');
    if (val.includes(':')) {
      setVal(processHref(val, mdOptions));
    }
    return renderer(tokens, idx, options, env, self);
  };
}
