import {matchSection} from '@kodality-web/marina-markdown';
import {tokenAttrValue} from './plugin.util';


export function drawioPlugin(md) {
  md.renderer.rules.drawio = (tokens, idx, /*options, env, self */) => {
    const base64 = tokenAttrValue(tokens[idx], 'data');
    return `<div><img class="drawio" src="data:image/svg+xml;base64, ${base64}"></div>`;
  };

  md.block.ruler.before('fence', 'drawio', (state, startl, endl, silent) => {
    const {failed, end, autoClosed, content} = matchSection('```drawio', '```', state, startl, endl, silent);
    if (failed) {
      return false;
    }

    const base64 = content.match(/```drawio\n?(.+)\n?```/)?.[1];
    if (!base64) {
      return false;
    }

    const token = state.push('drawio', '', 0);
    token.attrs = [['data', base64]];
    state.line = end.line + (autoClosed ? 1 : 0);
    return true;
  });
}
